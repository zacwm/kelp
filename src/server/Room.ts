import fs from 'fs-extra';
import path from 'path';
import * as SocketIO from 'socket.io';
import WebTorrent from 'webtorrent';
import fluentFfmpeg from 'fluent-ffmpeg';
import User from './User';
import { RoomStatus, RoomStatusPresets } from '../types';
import subtitleExtract from './subtitleExtract';

interface RoomInterface {
  setName(name: string): void;
  setPassword(password: string): void;
  hasPassword(): boolean;
  checkPassword(passwordInput: string): boolean;
  getAuthToken(): string;
  addUser(user: User): void;
  getUsers(): User[];
  createEvent(eventType: string, name?: string): void;
  removeUser(userId: string): void;
  updateUserName(id: any, newName: string): void;
  getVideoData(forceVideoData?: boolean): any
  getPlaybackState(): any;
  setTimePosition(time: number): void;
  runEndEvent(): void;
  resetRoom(noStatus?: boolean): void;
  // Torrent controls
  startTorrent(url: string, callback: any): void;
  convertFile(videoPath: string): void;
  cancelFfmpegProcesses(): void;
  // Internal
  setStatus(value: any): void;
}

class Room implements RoomInterface {
  private SocketServer: SocketIO.Server;
  id: string;
  name: string;
  private password: string;
  private authToken: string;
  private users: User[];
  eventHistory: any[];
  status: RoomStatus;
  // Video data
  private videoTitle: string;
  private videoURL: string;
  private videoSubtitle: string;
  private videoExtra: any;
  files: Array<any>;
  // Video playback data...
  playbackPlaying: boolean;
  private playbackTimePosition: number;
  private playbackTimePositionInterval: any;
  // Torrent
  private wtClient: any; // TODO: should be webtorrent client type, but cant find it rn...
  private torrent: any;
  private torrentCheckInterval: any;
  private ffmpegProcesses: any[];

  constructor(socketServer: SocketIO.Server, name: string, password?: string) {
    this.SocketServer = socketServer;
    this.id = makeid(6);
    this.name = name;
    this.password = password || '';
    this.authToken = makeid(32);
    this.users = [];
    this.eventHistory = [];

    this.status = RoomStatusPresets.WAITING;

    this.videoTitle = '';
    this.videoURL = '';
    this.playbackPlaying = false;
    this.playbackTimePosition = 0;
    this.playbackTimePositionInterval = null;
    this.ffmpegProcesses = [];

    fs.emptyDir(path.join(__dirname, `../.temp/${this.id}`));
  }

  setName(name: string): void {
    this.name = name;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  hasPassword(): boolean {
    return this.password !== '';
  }

  checkPassword(passwordInput: string): boolean {
    return this.password === passwordInput;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  getUsers(): User[] {
    return this.users;
  }

  createEvent(eventType: string, name?: string): void {
    const updatedEventHistory = this.eventHistory;
    updatedEventHistory.push({
      name: name || 'Kelp',
      value: eventType,
    });

    // If over 50, remove x amount to only keep last 50
    if (updatedEventHistory.length > 50) {
      updatedEventHistory.splice(0, updatedEventHistory.length - 50);
    }

    this.eventHistory = updatedEventHistory;
    this.SocketServer.emit('updateEvents', updatedEventHistory);
  }

  removeUser(userId: string): void {
    this.users = this.users.filter(user => user.id !== userId);
  }

  updateUserName(id: any, newName: string): void {
    const userPos = this.users.findIndex(user => user.id === id);
    if (userPos !== -1) {
      this.users[userPos].setName(newName || `User ${this.users.length + 1}`);
    }

    this.SocketServer.emit('updateRoom', {
      id: this.id,
      name: this.name,
      users: this.getUsers(),
      videoData: this.getVideoData(),
      videoState: this.status?.type == 'playing' ? this.getPlaybackState() : null,
    });
  }

  getVideoData(forceVideoData?: boolean): any {
    if (this.status?.type == 'playing' || forceVideoData) {
      return {
        url: this.videoURL,
        title: this.videoTitle,
        subtitle: this.videoSubtitle,
        files: (this.files || []).map(file => {
          return {
            id: file.id,
            name: file.name,
            selected: file.selected,
            downloadProgress: file.downloadProgress,
            ready: file.ready,
          };
        }),
        extra: this.videoExtra,
      };
    }
    return undefined;
  }

  getPlaybackState(): any {
    return {
      playing: this.playbackPlaying,
      timePosition: this.playbackTimePosition,
    };
  }

  setPlaying(playing: boolean, username?: string): void {
    this.playbackPlaying = playing;
    clearInterval(this.playbackTimePositionInterval);

    // Create the syncing interval
    if (playing) this.playbackTimePositionInterval = setInterval(() => {
      if (!this.playbackPlaying || this.status.type !== 'playing') {
        // Ensure that the playback is paused, if the status is not on the player
        this.playbackPlaying = false;
        clearInterval(this.playbackTimePositionInterval);
      } else {
        this.playbackTimePosition += 1;
      }
      this.SocketServer.emit('videoUpdateState', {
        roomId: this.id,
        newState: this.getPlaybackState(),
      });
    }, 1000);

    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });

    this.createEvent(playing ? 'pressed play.' : 'pressed pause.', username);
  }

  setTimePosition(time: number): void {
    this.playbackTimePosition = time;
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });
  }

  runEndEvent(): void {
    clearInterval(this.playbackTimePositionInterval);
    this.playbackTimePosition = 0;
    this.playbackPlaying = false;
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });
  }

  // Torrent controls
  async startTorrent(torrentData: any, callback?: any): Promise<void> {
    if (this.ffmpegProcesses.length > 0) return callback({ error: 'Already processing video...' });
    if (this.wtClient) return callback({ error: 'Already downloading...' });
    this.setStatus({ type: 'starting', message: 'Starting torrent download...' });

    await fs.emptyDir(path.join(__dirname, `../.temp/${this.id}`));
    if (!this.wtClient) this.wtClient = new WebTorrent();
    let selectedFile;

    const updateFileDownloadProgress = (filePath: string, progress?: number) => {
      progress = progress || 0;
      const files = this.files;
      const filePos = files.findIndex(file => file.path === filePath);
      // Check if file exists
      if (filePos !== -1) {
        const file = files[filePos];
        file.downloadProgress = (progress * 100).toFixed(2);
        file.ready = progress == 1;
        files[filePos] = file;
      }
      this.files = files;
    };

    this.wtClient.add(torrentData.url, { path: path.join(__dirname, `../.temp/${this.id}`) }, (torrent: any) => {
      this.torrent = torrent;
      this.files = torrent.files.filter(file => {
        return [
          '.mkv',
          '.mp4',
          '.avi',
          '.mov',
          '.wmv',
        ].includes(path.extname(file.path));
      }).map((file, index) => {
        return {
          id: makeid(16),
          name: file.name,
          path: file.path,
          downloadProgress: 0,
          ready: false,
          selected: torrentData?.file ? torrentData.file === file.name : index === 0,
        };
      });
      if (this.files.length <= 0) {
        torrent.destroy();
        return this.setStatus({ type: 'error', message: 'No video file found in torrent...' });
      }

      let selectedFileFinished = false;
      let torrentFinished = false;

      const setFinished = (type: string) => {
        if (type === 'selectedFile') selectedFileFinished = true;
        if (type === 'torrent') torrentFinished = true;
  
        if (selectedFileFinished && torrentFinished) {
          torrent.destroy();
          this.wtClient = null;
        }
      };

      selectedFile = torrent.files.find(file => file.path === this.files.find(file => file.selected).path);
      if (!selectedFile) {
        torrent.destroy();
        return this.setStatus({ type: 'error', message: 'No video file found in torrent...' });
      }

      const fileStream = selectedFile.createReadStream();

      fileStream.on('data', () => {
        if (!['starting', 'downloading'].includes(this.status?.type)) return;
        this.setStatus({
          type: 'downloading',
          message: 'Downloading...',
          percentage: (selectedFile.progress * 100).toFixed(2),
          timeRemaining: torrent.timeRemaining,
          speed: readableBytesPerSecond(this.torrent.downloadSpeed),
          peers: torrent.numPeers,
        });
      });
  
      fileStream.on('end', () => {
        this.videoTitle = torrentData?.name || torrent.name;
        this.convertFile(selectedFile.path);
        setFinished('selectedFile');
      });

      
      this.torrentCheckInterval = setInterval(() => {
        if (this.torrent.done || !this.wtClient) return clearInterval(this.torrentCheckInterval);
        console.info(`Room: ${this.id} | Files: ${torrent.files.length} | ${(torrent.progress * 100).toFixed(2)}% @ ${readableBytesPerSecond(torrent.downloadSpeed)}`);

        torrent.files.forEach((file: any) => {
          updateFileDownloadProgress(file.path, file.progress);
        });
        this.SocketServer.to(this.id).emit('videoUpdateData', this.getVideoData());
        
        if (!['starting', 'downloading'].includes(this.status?.type)) return;
        this.setStatus({
          type: 'downloading',
          message: 'Downloading...',
          percentage: selectedFile.progress * 100,
          timeRemaining: torrent.timeRemaining,
          speed: readableBytesPerSecond(torrent.downloadSpeed),
          peers: torrent.numPeers,
        });
      }, 1000);

      torrent.on('done', () => {
        if (this.torrentCheckInterval) clearInterval(this.torrentCheckInterval);
        torrent.files.forEach((file: any) => {
          updateFileDownloadProgress(file.path, 1);
        });
        this.SocketServer.to(this.id).emit('videoUpdateData', this.getVideoData());
        setFinished('torrent');
      });
    });
  }
  
  async convertFile(videoPath: string): Promise<void> {
    if (this.ffmpegProcesses.length > 0) return this.cancelFfmpegProcesses();
    await fs.emptyDir(path.join(__dirname, `../.streams/${this.id}`));
    this.setStatus({ type: 'processing', message: 'Processing...' });
    this.playbackTimePosition = 0;
    this.playbackPlaying = false;
    fs.pathExists(videoPath, async (err, exists) => {
      if (err) return this.setStatus({ type: 'error', message: 'Video file check failed...' });
      if (!exists) return this.setStatus({ type: 'error', message: 'Video file not found...' });
      const type = path.extname(videoPath);
      const roomId = this.id;
      const setStatus = this.setStatus.bind(this);
      const getFfmpegProcesses = () => {
        return this.ffmpegProcesses;
      };
      const addFfmpegProcess = (process) => {
        this.ffmpegProcesses.push(process);
      };
      let progress = [0];
      
      const setVideoPlayable = () => {
        this.videoURL = `/streams/${roomId}/index.m3u8`;
        setStatus({ type: 'playing', message: 'Watching a video' });
        getFfmpegProcesses().forEach((process) => {
          if (process) process.kill();
        });
        this.ffmpegProcesses = [];
      };

      if (type === '.mkv') {
        progress = [0, 0, 0];
        Promise.all([convertToMp4(1), subtitleExtract(videoPath, roomId)])
          .then((responses) => {
            if (responses[1]) {
              this.videoSubtitle = `/streams/${this.id}/subtitles.json`;
            }
            updateProgress(2, 99);
            return convertToHLS(3);
          })
          .then(() => setVideoPlayable() );
      } else if (['.mp4', '.mov'].includes(type)) {
        progress = [0];
        convertToHLS(1, videoPath)
          .then(() => setVideoPlayable() );
      } else {
        progress = [0, 0];
        convertToMp4(1)
          .then(() => {
            return convertToHLS(2);
          })
          .then(() => setVideoPlayable() );
      }

      function updateProgress(step: number, percentage: number) {
        progress[step - 1] = percentage;
        const total = progress.reduce((a, b) => a + b, 0) / progress.length;
        setStatus({ type: 'processing', message: 'Processing...', percentage: total });
      }

      function convertToMp4(step: number) {
        return new Promise((resolve) => {
          addFfmpegProcess(fluentFfmpeg(videoPath)
            .outputOptions(['-codec copy', '-movflags +faststart'])
            .on('error', convertError)
            .on('progress', (progress) => {
              if (progress?.percent) updateProgress(step, progress.percent);
            })
            .on('end', resolve)
            .save(path.join(__dirname, `../.temp/${roomId}/convert.mp4`)),
          );
        });
      }

      function convertToHLS(step: number, filePath?: string) {
        return new Promise((resolve) => {
          addFfmpegProcess(fluentFfmpeg(filePath || path.join(__dirname, `../.temp/${roomId}/convert.mp4`))
            .outputOptions([
              '-codec: copy',
              '-start_number 0',
              '-hls_time 10',
              '-hls_list_size 0',
              '-f hls',
            ])
            .on('error', convertError)
            .on('progress', (progress) => {
              if (progress?.percent) updateProgress(step, progress.percent);
            })
            .on('end', resolve)
            .save(path.join(__dirname, `../.streams/${roomId}/index.m3u8`)),
          );
        });
      }
      
      function convertError(err) {
        console.log(err);
        getFfmpegProcesses().forEach((process) => {
          if (process) process.kill();
        });
        this.ffmpegProcesses = [];
        setStatus({ type: 'error', message: 'Conversion failed...' });
      }
    });
  }

  cancelFfmpegProcesses(): void {
    this.ffmpegProcesses.forEach((process) => {
      if (process) process.kill();
    });
    this.ffmpegProcesses = [];
  }

  async resetRoom(noStatus?: boolean): Promise<void> {
    if (noStatus === true) noStatus = noStatus || false;
    
    if (noStatus !== true) this.setStatus({
      type: 'resetting',
      message: 'Resetting...',
    });
    if (this.wtClient) {
      try {
        this.wtClient.destroy();
      } catch (wtClientDestroy) {
        console.error(wtClientDestroy);
      }
      this.wtClient = null;
    }
    
    if (this.ffmpegProcesses.length > 0) {
      this.cancelFfmpegProcesses();
    }

    await fs.emptyDir(path.join(__dirname, `../.temp/${this.id}`));
    await fs.emptyDir(path.join(__dirname, `../.streams/${this.id}`));

    this.setStatus({
      'type': 'waiting',
      'message': 'Looking for something to watch...',
    });
  }

  // Internal class functions
  setStatus(value: any): void {
    // New Status
    if (value.percentage === undefined) {
      value.percentage = null;
    }

    if (value.timeRemaining === undefined) {
      value.timeRemaining = null;
    }

    if (value.speed === undefined) {
      value.speed = null;
    }

    if (value.peers === undefined) {
      value.peers = null;
    }

    this.status = {...this.status, ...value};

    if (this.status.type === 'playing') {
      this.SocketServer.to(this.id).emit('videoUpdateData', this.getVideoData());
      this.SocketServer.to(this.id).emit('videoUpdateState', this.getPlaybackState());
    }
    
    // Update the room status to all users in the room
    this.SocketServer.to(this.id).emit('roomUpdateStatus', this.status);
  }
}

export default Room;

// Helper functions
function readableBytesPerSecond(fileSizeInBytes) {
  const fileSizeInMbps = fileSizeInBytes / 125000;
  if (fileSizeInMbps > 1000) {
    return `${(fileSizeInMbps / 1000).toFixed(1)} Gbps`;
  }
  return `${fileSizeInMbps.toFixed(1)} Mbps`;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}