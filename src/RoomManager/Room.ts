import fs from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';
import User from '../User';
import * as SocketIO from 'socket.io';
import WebTorrent from 'webtorrent';
import FFmpeg from '../ffmpeg';

interface RoomInterface {
  setName(name: string): void;
  setPassword(password: string): void;
  hasPassword(): boolean;
  getPassword(): string;
  getAuthToken(): string;
  addUser(user: User): void;
  getUsers(): User[];
  removeUser(userId: string): void;
  updateUserName(id: any, newName: string): void;
  getVideoData(forceVideoData?: boolean): any
  getPlaybackState(): any;
  setTimePosition(time: number): void;
  runEndEvent(): void;
  resetRoom(noStatus?: boolean): void;
  // Torrent controls
  startTorrent(url: string, callback: any): void;
  convertTorrent(videoPath: string): void;
  // Internal
  setStatus(statusCode: number, message: string, percentage: number, timeRemaining: number, speed: string): void;
}

class Room implements RoomInterface {
  private SocketServer: SocketIO.Server;
  id: string;
  name: string;
  private password: string;
  private authToken: string;
  private users: User[];
  // Room statuses
  statusCode: number;
  status: string;
  statusPercentage: number;
  statusTimeRemaining: number;
  statusSpeed: string;
  // Video data
  private videoTitle: string;
  private videoURL: string;
  private videoSubtitle: string;
  private videoExtra: any;
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
    this.id = uuid();
    this.name = name;
    this.password = password || '';
    this.authToken = uuid(); // TODO: Replace with a heavier token...
    this.users = [];
    this.statusCode = 1;
    this.status = 'Waiting';
    this.statusPercentage = 0;
    this.statusTimeRemaining = 0;
    this.statusSpeed = '';
    this.videoTitle = '';
    this.videoURL = 'https://kelp.sneeze.xyz/streams/test/output.m3u8';
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

  getPassword(): string {
    return this.password;
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
      users: this.getUsers().map(userItem => {
        return {
          id: userItem.id,
          name: userItem.name,
        };
      }),
      videoData: this.getVideoData(),
      videoState: this.statusCode === 0 ? this.getPlaybackState() : null,
    });
  }

  getVideoData(forceVideoData?: boolean): any {
    if (this.statusCode === 0 || forceVideoData) {
      return {
        statusCode: this.statusCode,
        status: this.status,
        url: this.videoURL,
        title: this.videoTitle,
        subtitle: this.videoSubtitle,
        extra: this.videoExtra,
      };
    } else {
      return {
        statusCode: this.statusCode,
        status: this.status,
        percentage: this.statusPercentage,
        timeRemaining: this.statusTimeRemaining,
        downloadSpeed: this.statusSpeed,
        extra: this.videoExtra,
      };
    }

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
      if (!this.playbackPlaying || this.statusCode !== 0) {
        // Ensure that the playback is paused, if the statusCode is not 0
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
    if (username) this.SocketServer.emit('notify', {
      roomId: this.id,
      message: `Video ${playing ? 'resumed' : 'paused'} by ${username}`,
      variant: 'success',
      autoHideDuration: 1000,
    });
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
    if (this.wtClient) return callback({ error: 'Already downloading torrent...' });
    this.setStatus(2, 'Staring download...');
    await fs.emptyDir(path.join(__dirname, `../.temp/${this.id}`));
    if (!this.wtClient) this.wtClient = new WebTorrent();
    this.wtClient.add(url, { path: path.join(__dirname, `../.temp/${this.id}`) }, (torrent: any) => {
      this.torrent = torrent;
      const videoFile = torrent.files.find(file => ['.mkv', '.mp4'].includes(path.extname(file.path)));
      if (!videoFile) {
        torrent.destroy();
        return this.setStatus(-1, 'No video file found in torrent...');
      }

      this.torrentCheckInterval = setInterval(() => {
        if (this.torrent.done || !this.wtClient) return clearInterval(this.torrentCheckInterval);

        this.videoExtra = {
          ...this.videoExtra,
          maxDownloadSpeed: this.videoExtra?.maxDownloadSpeed || 0 < torrent.downloadSpeed ? torrent.downloadSpeed : this.videoExtra?.maxDownloadSpeed || 0,
          lowDownloadSpeed: this.videoExtra?.lowDownloadSpeed || 0 > torrent.downloadSpeed ? torrent.downloadSpeed : this.videoExtra?.lowDownloadSpeed || 0,
          torrentFiles: torrent.files.length,
          torrentSize: formatBytes(torrent.length),
        };

        console.log(`Room: ${this.id} | Files: ${torrent.files.length} | ${(torrent.progress * 100).toFixed(2)}% @ ${formatBytes(torrent.downloadSpeed)}/sec`);
        this.setStatus(3, 'Downloading torrent...', torrent.progress * 100, torrent.timeRemaining, `${formatBytes(torrent.downloadSpeed)}/s`);
      }, 500);

      torrent.on('done', () => {
        /* // TODO: This issue marked as a bug from over 2 years ago... https://github.com/webtorrent/webtorrent/issues/1931
        if (this.wtClient) this.wtClient.destory();
        */
        this.wtClient = null;
        if (this.torrentCheckInterval) clearInterval(this.torrentCheckInterval);
        this.videoTitle = torrent.name;
        this.convertTorrent(videoFile.path);
      });
    });
  }
  
  async convertTorrent(videoPath: string): Promise<void> {
    if (this.ffmpeg.process) return;
    await fs.emptyDir(path.join(__dirname, `../.streams/${this.id}`));
    this.setStatus(4, 'Staring conversion...');
    this.playbackTimePosition = 0;
    this.playbackPlaying = false;
    fs.pathExists(videoPath, async (err, exists) => {
      if (err) return this.setStatus(-1, 'Video file check failed...');
      if (!exists) return this.setStatus(-1, 'Video file not found...');
      const type = path.extname(videoPath);

      if (type === '.mkv') {
        this.setStatus(5, 'Converting - 0/3 files done');
        this.ffmpeg.convertVideoToMP4(videoPath, this.id)
          .then(({ mp4Path }) => {
            this.setStatus(5, 'Converting - 1/3 files done');
            this.ffmpeg.convertVideoToHLS(mp4Path, this.id)
              .then(() => {
                this.videoURL = `/streams/${this.id}/index.m3u8`;
                this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
                this.setStatus(5, 'Converting - 2/3 files done');
                this.ffmpeg.extractSubtitles(videoPath, this.id)
                  .then(() => {
                    this.videoSubtitle = `/streams/${this.id}/subtitles.vtt`;
                    this.setStatus(0, 'Ready');
                  })
                  .catch((err) => {
                    console.dir(err);
                    return this.setStatus(0, 'Ready');
                  });
              })
              .catch((err) => {
                console.error(err);
                return this.setStatus(-1, 'File conversion failed...');
              });
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus(-1, 'File conversion failed...');
          });
      } else if (['.avi', '.wmv'].includes(type)) {
        this.setStatus(5, 'Converting - 0/2 files done');
        this.ffmpeg.convertVideoToMP4(videoPath, this.id)
          .then(({ mp4Path }) => {
            this.setStatus(5, 'Converting - 1/2 files done');
            this.ffmpeg.convertVideoToHLS(mp4Path, this.id)
              .then(() => {
                this.videoURL = `/streams/${this.id}/index.m3u8`;
                this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
                this.setStatus(0, 'Ready');
              })
              .catch((err) => {
                console.error(err);
                return this.setStatus(-1, 'File conversion failed...');
              });
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus(-1, 'File conversion failed...');
          });
      } else if (['.mp4', '.mov'].includes(type)) {
        this.setStatus(5, 'Converting - 0/1 files done');
        this.ffmpeg.convertVideoToHLS(videoPath, this.id)
          .then(() => {
            this.videoURL = `/streams/${this.id}/index.m3u8`;
            this.videoExtra = { ...this.videoExtra, hlsFileCount: fs.readdirSync(path.join(__dirname, `../.streams/${this.id}`)).length };
            this.setStatus(0, 'Ready');
          })
          .catch((err) => {
            console.error(err);
            return this.setStatus(-1, 'File conversion failed...');
          });
      } else {
        return this.setStatus(-1, 'Unsupported file type...');
      }
    });
  }

  resetRoom(noStatus?: boolean): void {
    if (noStatus) this.setStatus(10, 'Resetting room...');
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
  }

  // Internal class functions
  setStatus(statusCode: number, message?: string, percentage?: number, timeRemaining?: number, speed?: string): void {
    this.statusCode = statusCode;
    this.status = message || '';
    this.statusPercentage = percentage || 0;
    this.statusTimeRemaining = timeRemaining || 0;
    this.statusSpeed = speed || null;
    this.SocketServer.emit('videoUpdateData', {
      roomId: this.id,
      newData: statusCode === 0 ? this.getVideoData(true) : this.getVideoData(),
    });
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.statusCode === 0 ? this.getPlaybackState() : null,
    });
  }
}

export default Room;

// Helper functions
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}