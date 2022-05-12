import fs from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';
import User from '../User';
import * as SocketIO from 'socket.io';
import WebTorrent from 'webtorrent';
import childProcess from 'child_process';

interface RoomInterface {
  setName(name: string): void;
  setPassword(password: string): void;
  hasPassword(): boolean;
  getPassword(): string;
  getAuthToken(): string;
  addUser(user: User): void;
  getUsers(): User[];
  removeUser(userId: string): void;
  getVideoData(): any;
  getPlaybackState(): any;
  setTimePosition(time: number): void;
  runEndEvent(): void;
  // Internal
  setStatus(status: string, percentage: number): void;
  // Torrent controls
  startTorrent(url: string): void;
  destroyTorrent(): void

}

class Room implements RoomInterface {
  private SocketServer: SocketIO.Server;
  id: string;
  name: string;
  private password: string;
  private authToken: string;
  private users: User[];
  // Room preparing status
  status: string;
  statusError: string;
  statusPercentage: number;
  statusTimeRemaining: number;
  statusSpeed: string;
  // Video data
  private videoTitle: string;
  private videoURL: string;
  private videoSubtitle: string;
  // Video playback data...
  private playbackPlaying: boolean;
  private playbackTimePosition: number;
  private playbackTimePositionTimeout: any;
  // Torrent
  private wtClient: any; // TODO: should be webtorrent client type, but cant find it rn...
  private torrent: any;
  private torrentCheckInterval: any;
  private ffmpegProcess: any;

  constructor(socketServer: SocketIO.Server, name: string, password?: string) {
    this.SocketServer = socketServer;
    this.id = uuid();
    this.name = name;
    this.password = password || '';
    this.authToken = uuid(); // TODO: Replace with a heavier token...
    this.users = [];
    this.status = null;
    this.statusPercentage = 0;
    this.statusTimeRemaining = 0;
    this.statusSpeed = '';
    this.videoTitle = '';
    this.videoURL = 'https://kelp.sneeze.xyz/streams/test/output.m3u8';
    this.playbackPlaying = false;
    this.playbackTimePosition = 0;
    this.playbackTimePositionTimeout = null;

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

  getVideoData(): any {
    if (this.status !== 'ready') {
      return {
        preparing: true,
        status: this.status,
        statusError: this.statusError,
        percentage: this.statusPercentage,
        timeRemaining: this.statusTimeRemaining,
        downloadSpeed: this.statusSpeed,
      };
    } else {
      return {
        url: this.videoURL,
        title: this.videoTitle,
        subtitle: this.videoSubtitle,
      };
    }
  }

  getPlaybackState(): any {
    return {
      playing: this.playbackPlaying,
      timePosition: this.playbackTimePosition,
    };
  }

  setPlaying(playing: boolean): void {
    this.playbackPlaying = playing;
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });

    // Changes to syncing timeout...
    if (this.playbackPlaying) {
      // Create the syncing interval
      this.playbackTimePositionTimeout = setInterval(() => {
        this.playbackTimePosition += 1;
        this.SocketServer.emit('videoUpdateState', {
          roomId: this.id,
          newState: this.getPlaybackState(),
        });
      }, 1000);
    } else {
      // If paused, it can be stopped...
      clearInterval(this.playbackTimePositionTimeout);
    }
  }

  setTimePosition(time: number): void {
    this.playbackTimePosition = time;
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });
  }

  runEndEvent(): void {
    clearInterval(this.playbackTimePositionTimeout);
    this.playbackTimePosition = 0;
    this.playbackPlaying = false;
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });
  }

  setStatus(status: string, percentage: number): void {
    this.status = status;
    this.statusPercentage = percentage;
    this.SocketServer.emit('videoUpdateData', {
      roomId: this.id,
      newData: this.getVideoData(),
    });
    this.SocketServer.emit('videoUpdateState', {
      roomId: this.id,
      newState: this.getPlaybackState(),
    });
  }

  // Torrent controls
  startTorrent(url: string): any {
    if (this.ffmpegProcess) return { error: 'Busy converting... Handle cancel here.' };
    if (this.wtClient) return { error: 'Existing client...' };
    this.status = 'Starting...';
    if (!this.wtClient) this.wtClient = new WebTorrent();
    this.wtClient.add(url, { path: path.join(__dirname, `../.temp/${this.id}`) }, (torrent: any) => {
      this.torrent = torrent;

      this.torrentCheckInterval = setInterval(() => {
        if (this.torrent.done || !this.wtClient) return clearInterval(this.torrentCheckInterval);
        console.log(`Room: ${this.id} | File: ${torrent.files[0].name} | ${(torrent.progress * 100).toFixed(2)}% @ ${formatBytes(torrent.downloadSpeed)}/sec`);
        this.status = 'Downloading torrent...';
        this.statusPercentage = torrent.progress * 100;
        this.statusTimeRemaining = torrent.timeRemaining;
        this.statusSpeed = `${formatBytes(torrent.downloadSpeed)}/s`;
        this.emitUpdateRoom(true);
      }, 500);

      torrent.on('done', () => {
        if (this.torrentCheckInterval) clearInterval(this.torrentCheckInterval);
        this.videoTitle = torrent.name;
        this.status = 'Processing...';
        this.convertTorrent(path.join(__dirname, `../.temp/${this.id}`, torrent.files[0].name));
        if (this.wtClient) this.wtClient.destory();
      });
    });
  }

  destroyTorrent(): void {
    if (this.wtClient) {
      this.wtClient.destroy();
      this.wtClient = null;
    }
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
      this.ffmpegProcess = null;
    }

    if (this.status !== 'ready') {
      this.status = 'nothing';
    }

    this.emitUpdateRoom(true);
  }
  
  async convertTorrent(videoPath: string): Promise<void> {
    if (this.ffmpegProcess) return;
    await fs.emptyDir(path.join(__dirname, `../.streams/${this.id}`));
    fs.pathExists(videoPath, (err, exists) => {
      if (err) return console.log(err);
      if (!exists) return console.log('File does not exist: ' + videoPath);

      // File exists, start converting...
      this.statusPercentage = 0;
      this.statusTimeRemaining = 0;
      this.statusSpeed = null;
      this.status = 'Converting - 0/3 files done';
      this.emitUpdateRoom(true);

      this.ffmpegProcess = childProcess.exec(`ffmpeg -i "${videoPath}" -codec copy "${path.join(__dirname, `../.temp/${this.id}/convert.mp4`)}"`, (err, mp4Stdout, mp4Stderr) => {
        if (err) return console.log(err);
        if (mp4Stdout || mp4Stderr) {
          this.status = 'Converting - 1/3 files done';
          this.emitUpdateRoom(true);
          
          // Now convert to HLS
          this.ffmpegProcess = childProcess.exec(`ffmpeg -i "${path.join(__dirname, `../.temp/${this.id}/convert.mp4`)}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${path.join(__dirname, `../.streams/${this.id}/index.m3u8`)}"`, (err, videoStdout, videoStderr) => {
            if (err) return console.log(err);
            if (videoStdout || videoStderr) {
              this.status = 'Converting - 2/3 files done';
              this.videoURL = `/streams/${this.id}/index.m3u8`;
              this.emitUpdateRoom(true);
    
              this.ffmpegProcess = childProcess.exec(`ffmpeg -i "${videoPath}" -map 0:s:0 "${path.join(__dirname, `../.streams/${this.id}/subtitle.vtt`)}"`, (err, subtitleStdout, subtitleStderr) => {
                if (err) return console.log(err);
        
                if (subtitleStdout || subtitleStderr) {
                  this.status = 'ready';
                  this.videoSubtitle = `/streams/${this.id}/subtitle.vtt`;
                  this.ffmpegProcess = null;
                  this.emitUpdateRoom();
                }
              });
            }
          });
        }
      });

      // to hls
      /*
      this.ffmpegProcess = childProcess.exec(`ffmpeg -i "${videoPath}" -sn -c:v h264 -profile:v main -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 10 -hls_playlist_type vod "${destinationPath}"`, (err, stdout, stderr) => {
        if (err) return console.log(err);
        console.log(stdout);
        console.log(stderr);

        this.status = 'ready';
        this.videoURL = `/streams/${this.id}/index.m3u8`;
        this.emitUpdateRoom();
      });
      */

      /*
      this.ffmpegProcess = childProcess.spawn(`ffmpeg -i "${videoPath}" -sn -c:v h264 -profile:v main -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 10 -hls_playlist_type vod "${destinationPath}"`);
      this.ffmpegProcess = childProcess.spawn('ffmpeg', ['-i', videoPath, '-sn', '-c:v', 'h264', '-profile:v', 'main', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0', '-hls_time', '10', '-hls_playlist_type', 'vod', destinationPath]);
      this.ffmpegProcess.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
      });
      
      this.ffmpegProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
      });
      */

    });
  }

  // Internal class functions
  private emitUpdateRoom(nullState = false): void {
    this.SocketServer.emit('updateRoom', {
      id: this.id,
      name: this.name,
      users: this.getUsers().map(userItem => {
        return {
          id: userItem.id,
          name: userItem.name || null,
        };
      }),
      videoData: this.getVideoData(),
      videoState: this.status === 'ready' && !nullState ? this.getPlaybackState() : null,
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