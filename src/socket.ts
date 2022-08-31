import * as SocketIO from 'socket.io';
import path from 'path';
import Room from './RoomManager/Room';
import RoomManager from './RoomManager';
import User from './User';
import axios from 'axios';

class SocketServer {
  private io: SocketIO.Server;
  public Rooms: RoomManager;

  constructor(ioServer: SocketIO.Server) {
    this.io = ioServer;
    this.Rooms = new RoomManager(this.io);
    
    this.io.on('connection', (socket: SocketIO.Socket) => {
      let user;
      let currentRoom;
  
      this.io.emit('getRoomsList', this.Rooms.getRoomList());
  
      socket.on('disconnect', () => {
        if (!currentRoom) return;

        const room: Room = this.Rooms.getRoomById(currentRoom);
        
        // Check if the room still exists. Disconnect event still runs if the room was closed.
        if (!room) return;

        room.removeUser(user.id);

        this.io.emit('updateRoom', {
          id: room.id,
          name: room.name,
          users: room.getUsers().map(userItem => {
            return {
              id: userItem.id,
              name: userItem.name || null,
            };
          }),
          videoData: room.getVideoData(),
          videoState: room.statusCode === 0 ? room.getPlaybackState() : null,
        });
      });
  
      // Room related events
      socket.on('createRoom', (roomData: any, callback: any) => {
        if (this.Rooms.getRoomCount() >= parseInt(process.env.ROOM_LIMIT)) return callback({ error: 'Room limit reached... Wait till rooms have closed...' });
        // Validate room name...
        if (typeof roomData.name !== 'string') return callback({ error: 'Room name must be a string' });
        if (roomData.name.length < 1) return callback({ error: 'Room name is required' });
        if (roomData.name.length > 15) return callback({ error: 'Room name must be at most 15 characters' });
  
        // Validate room password if there is one...
        if (roomData.password) {
          if (typeof roomData.password !== 'string') return callback({ error: 'Room password must be a string' });
          if (roomData.password.length > 30) return callback({ error: 'Room password must be at most 30 characters' });
        }
        
        // Create room...
        const room: Room = this.Rooms.createRoom(roomData.name, roomData.password);
        callback({ roomId: room.id });
  
        this.io.emit('getRoomsList', this.Rooms.getRoomList());
      });

      socket.on('getRoomSummary', (roomId: string, callback: any) => {
        const room: Room = this.Rooms.getRoomById(roomId);
        if (!room) return callback({ error: 'Room does not exist' });
        callback({
          id: room.id,
          name: room.name,
          hasPassword: room.hasPassword(),
        });
      });
  
      socket.on('joinRoom', (roomData: any, callback: any) => {
        const room: Room = this.Rooms.getRoomById(roomData.id);
        if (!room) return callback({ error: 'Room does not exist', roomNotFound: true });
        // NOTE: Checks if room has password, but it may not be needed after 'getRoomSummary' socket event.
        if (room.hasPassword() && (!roomData.password || roomData.password === '')) return callback({ userError: 'Room requires a password', hasPassword: true });
        if (room.hasPassword() && roomData.password !== room.getPassword()) return callback({ userError: 'Room password is incorrect', hasPassword: true });
        socket.join(room.id);
        currentRoom = room.id;
        // TODO: Have a name validation check for allowed characters and length. If not, throw userError.
        user = new User(socket.id, roomData.name);
        room.addUser(user);
        const roomDataToSend: any = {
          id: room.id,
          name: room.name,
          users: room.getUsers().map(userItem => {
            return {
              id: userItem.id,
              name: userItem.name,
            };
          }),
          videoData: room.getVideoData(),
          videoState: room.statusCode === 0 ? room.getPlaybackState() : null,
        };
  
        callback({
          user: user.id,
          room: roomDataToSend
        });
  
        this.io.to(room.id).emit('updateRoom', roomDataToSend);
      });

      socket.on('resetRoom', (roomId: string) => {
        const room: Room = this.Rooms.getRoomById(roomId);
        room.resetRoom();
      });

      socket.on('closeRoom', (roomId: string) => {
        const room: Room = this.Rooms.getRoomById(roomId);
        this.Rooms.closeRoom(room);
      });

      // Popcorn Time API integration
      socket.on('getTitles', async (opts, callback) => {
        try {
          const urlParamsList = [];
          if (opts.keywords) urlParamsList.push(`keywords=${opts.keywords.replace(' ', '%20')}`);
          if (opts.genre) urlParamsList.push(`genre=${opts.genre}`);
          if (opts.sort) urlParamsList.push(`sort=${opts.sort}`);

          const { data } = await axios.get(`https://movies-api.ga/${opts.category}/${opts.page || 1}?${urlParamsList.join('&')}`);
          if ((data || []).length === 0) return callback({ error: 'No titles found' });
          callback({ titles: data || [] });
        } catch (err) {
          console.warn(err);
          callback({ error: 'Internal Server Error' });
        }
      });

      socket.on('getShowData', async (showId, callback) => {
        try {
          const { data } = await axios.get(`https://movies-api.ga/show/${showId}`);
          callback({ show: data });
        } catch (err) {
          console.warn(err);
          callback({ error: 'Internal Server Error' });
        }
      });
  
      socket.on('updateUserName', (data: any) => {
        if (currentRoom !== data.roomId) return;
        const room: Room = this.Rooms.getRoomById(data.roomId);
        if (!room || !user) return;
        this.Rooms.getRoomById(data.roomId).updateUserName(socket.id, data.name.substring(0, 15));
      });
  
      socket.on('roomStartTorrent', (data: any, callback: any) => {
        if (currentRoom !== data.id) return;
        const room: Room = this.Rooms.getRoomById(data.id);
        if (!room) return;
        const videoData: any = room.getVideoData();
        if (![0, 1].includes(videoData.statusCode)) return;
  
        room.startTorrent(data.url, callback);
      });

      socket.on('videoSelectFile', (data: any) => {
        if (currentRoom !== data.roomId) return;
        const room: Room = this.Rooms.getRoomById(data.roomId);
        if (!room) return;

        // Find and return the file specified.
        const videoFile = (room.files || []).find(file => file.id === data.fileId);
        if (!videoFile) return;
        
        // Begin the file ffmpeg conversion and play the file (if file exists);
        room.convertFile(videoFile.path);
      });
  
      socket.on('videoChangePlaybackPlaying', (roomData: any, playing: boolean) => {
        if (currentRoom !== roomData.id) return;
  
        this.Rooms.getRoomById(currentRoom).setPlaying(playing, user.name);
      });
  
      socket.on('videoChangePlaybackTime', (roomData: any, time: number) => {
        if (currentRoom !== roomData.id) return;
  
        this.Rooms.getRoomById(currentRoom).setTimePosition(time);
        this.io.emit('videoUpdateTimePosition', { roomId: roomData.id, newTimePosition: time });
      });
  
      socket.on('videoChangePlayback', (roomData: any, playing: boolean) => {
        if (currentRoom !== roomData.id) return;
  
        this.Rooms.getRoomById(currentRoom).setPlaying(playing);
      });
  
      socket.on('videoEndedEvent', (roomData: any) => {
        if (currentRoom !== roomData.id) return;
  
        this.Rooms.getRoomById(currentRoom).runEndEvent();
      });
  
      // Testing sockets
      socket.on('playerTest', (id: string, type: number) => {
        switch (type) {
        case 1:
          this.Rooms.getRoomById(id).resetRoom();
          break;
        case 2:
          this.Rooms.getRoomById(id).convertFile(path.join(__dirname, './test/test.mkv'));
          break;
        case 3:
          this.Rooms.getRoomById(id).convertFile(path.join(__dirname, './test/test.mp4'));
          break;
        case 4:
          this.Rooms.getRoomById(id).convertFile(path.join(__dirname, './test/test.avi'));
          break;
        case 5:
          this.Rooms.getRoomById(id).convertFile(path.join(__dirname, './test/test.mov'));
          break;
        }
      });
    });
  }
}

export default SocketServer;