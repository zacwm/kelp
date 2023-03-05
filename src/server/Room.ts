import fs from 'fs-extra';
import path from 'path';
import User from './User';
import * as SocketIO from 'socket.io';
import WebTorrent from 'webtorrent';
import FFmpeg from './ffmpeg';
import { RoomStatus, RoomStatusPresets } from '../types';

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
  private ffmpeg: FFmpeg;

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
    this.ffmpeg = new FFmpeg();

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
          return { id: file.id, name: file.name };
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
  async startTorrent(url: string, callback?: any): Promise<void> {
    if (this.ffmpeg.process) return callback({ error: 'Already processing video...' });
    if (this.wtClient) return callback({ error: 'Already downloading...' });
    this.setStatus({ type: 'starting', message: 'Starting torrent download...' });

    await fs.emptyDir(path.join(__dirname, `../.temp/${this.id}`));
    if (!this.wtClient) this.wtClient = new WebTorrent();
    this.wtClient.add(url, { path: path.join(__dirname, `../.temp/${this.id}`) }, (torrent: any) => {
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
        return { id: makeid(16), name: file.name, path: file.path, selected: index === 0 };
      });
      if (this.files.length <= 0) {
        torrent.destroy();
        return this.setStatus({ type: 'error', message: 'No video file found in torrent...' });
      }

      this.torrentCheckInterval = setInterval(() => {
        if (this.torrent.done || !this.wtClient) return clearInterval(this.torrentCheckInterval);

        this.videoExtra = {
          ...this.videoExtra,
          maxDownloadSpeed: this.videoExtra?.maxDownloadSpeed || 0 < torrent.downloadSpeed ? torrent.downloadSpeed : this.videoExtra?.maxDownloadSpeed || 0,
          lowDownloadSpeed: this.videoExtra?.lowDownloadSpeed || 0 > torrent.downloadSpeed ? torrent.downloadSpeed : this.videoExtra?.lowDownloadSpeed || 0,
          torrentFiles: torrent.files.length,
          torrentSize: readableBytesPerSecond(torrent.length),
        };

        console.log(`Room: ${this.id} | Files: ${torrent.files.length} | ${(torrent.progress * 100).toFixed(2)}% @ ${readableBytesPerSecond(torrent.downloadSpeed)}`);
        this.setStatus({
          type: 'downloading',
          message: 'Downloading...',
          percentage: torrent.progress * 100,
          timeRemaining: torrent.timeRemaining,
          speed: readableBytesPerSecond(torrent.downloadSpeed),
        });
      }, 500);

      torrent.on('done', () => {
        /* // TODO: This issue marked as a bug from over 2 years ago... https://github.com/webtorrent/webtorrent/issues/1931
        if (this.wtClient) this.wtClient.destory();
        */
        torrent.destroy();
        this.wtClient = null;
        if (this.torrentCheckInterval) clearInterval(this.torrentCheckInterval);
        this.videoTitle = torrent.name;
        this.convertFile(this.files[0].path);
      });
    });
  }
  
  async convertFile(videoPath: string): Promise<void> {
    if (this.ffmpeg.process) return this.ffmpeg.stop();
    await fs.emptyDir(path.join(__dirname, `../.streams/${this.id}`));
    this.setStatus({ type: 'processing', message: 'Converting...' });
    this.playbackTimePosition = 0;
    this.playbackPlaying = false;
    fs.pathExists(videoPath, async (err, exists) => {
      if (err) return this.setStatus({ type: 'error', message: 'Video file check failed...' });
      if (!exists) return this.setStatus({ type: 'error', message: 'Video file not found...' });
      const type = path.extname(videoPath);

      if (type === '.mkv') {
        this.setStatus({
          type: 'processing',
          watching: 'Processing...',
          percentage: (0 / 3) * 100,
        });
        this.ffmpeg.convertVideoToMP4(videoPath, this.id)
          .then(({ mp4Path }) => {
            this.setStatus({
              type: 'processing',
              watching: 'Processing...',
              percentage: (1 / 3) * 100,
            });
            this.ffmpeg.convertVideoToHLS(mp4Path, this.id)
              .then(() => {
                this.videoURL = `/streams/${this.id}/index.m3u8`;
                this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
                this.setStatus({
                  type: 'processing',
                  watching: 'Processing...',
                  percentage: (2 / 3) * 100,
                });
                this.ffmpeg.extractSubtitles(videoPath, this.id)
                  .then(() => {
                    this.videoSubtitle = `/streams/${this.id}/subtitles.json`;
                  })
                  .finally(() => {
                    this.setStatus({ type: 'playing', message: `Watching '${this.videoTitle}'` });
                  });
              })
              .catch((err) => {
                console.error(err);
                return this.setStatus({ type: 'error', message: 'File conversion failed...' });
              });
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus({ type: 'error', message: 'File conversion failed...' });
          });
      } else if (['.avi', '.wmv'].includes(type)) {
        this.setStatus({
          type: 'processing',
          watching: 'Processing...',
          percentage: (0 / 2) * 100,
        });
        this.ffmpeg.convertVideoToMP4(videoPath, this.id)
          .then(({ mp4Path }) => {
            this.setStatus({
              type: 'processing',
              watching: 'Processing...',
              percentage: (1 / 2) * 100,
            });
            this.ffmpeg.convertVideoToHLS(mp4Path, this.id)
              .then(() => {
                this.videoURL = `/streams/${this.id}/index.m3u8`;
                this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
                this.setStatus({ type: 'playing', message: `Watching '${this.videoTitle}'` });
              })
              .catch((err) => {
                console.error(err);
                return this.setStatus({ type: 'error', message: 'File conversion failed...' });
              });
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus({ type: 'error', message: 'File conversion failed...' });
          });
      } else if (['.mp4', '.mov'].includes(type)) {
        this.setStatus({
          type: 'processing',
          watching: 'Processing...',
          percentage: (0 / 1) * 100,
        });
        this.ffmpeg.convertVideoToHLS(videoPath, this.id)
          .then(() => {
            this.videoURL = `/streams/${this.id}/index.m3u8`;
            this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
            this.setStatus({ type: 'playing', message: `Watching '${this.videoTitle}'` });
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus({ type: 'error', message: 'File conversion failed...' });
          });
      } else {
        return this.setStatus({ type: 'error', message: 'Unsupported file type...' });
      }
    });
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
    if (this.ffmpeg.process) {
      this.ffmpeg.stop();
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