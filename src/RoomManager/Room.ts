import { v4 as uuid } from 'uuid';
import User from '../User';
import * as SocketIO from 'socket.io';

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
  statusPercentage: number;
  private torrentURL: string;
  // Video data
  private videoTitle: string;
  private videoURL: string;
  // Video playback data...
  private playbackPlaying: boolean;
  private playbackTimePosition: number;
  private playbackTimePositionTimeout: any;

  constructor(socketServer: SocketIO.Server, name: string, password?: string) {
    this.SocketServer = socketServer;
    this.id = uuid();
    this.name = name;
    this.password = password || '';
    this.authToken = uuid(); // TODO: Replace with a heavier token...
    this.users = [];
    this.status = 'preparing';
    this.statusPercentage = 0;
    this.videoTitle = 'A Silent Voice';
    this.videoURL = 'https://kelp.sneeze.xyz/streams/test/output.m3u8';
    this.playbackPlaying = false;
    this.playbackTimePosition = 0;
    this.playbackTimePositionTimeout = null;
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
        stage: this.status,
        percentage: this.statusPercentage,
      };
    } else {
      return {
        url: this.videoURL,
        title: this.videoTitle,
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
}

export default Room;