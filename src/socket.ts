import * as SocketIO from 'socket.io';
import path from 'path';
import Room from './RoomManager/Room';
import RoomManager from './RoomManager';
import User from './User';

class SocketServer {
  private io: SocketIO.Server;
  private Rooms: RoomManager;

  constructor(ioServer: SocketIO.Server) {
    this.io = ioServer;
    this.Rooms = new RoomManager(this.io);
    
    this.io.on('connection', (socket: SocketIO.Socket) => {
      let user;
      let currentRoom;
  
      this.io.emit('allRooms', this.Rooms.getRoomList());
  
      socket.on('disconnect', () => {
        if (!currentRoom) return;
        const room: Room = this.Rooms.getRoomById(currentRoom);
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
  
        this.io.emit('allRooms', this.Rooms.getRoomList());
      });
  
      socket.on('joinRoom', (roomData: any, callback: any) => {
        const room: Room = this.Rooms.getRoomById(roomData.id);
        if (!room) return callback({ error: 'Room does not exist', roomNotFound: true });
        if (room.hasPassword() && (!roomData.password || roomData.password === '')) return callback({ error: 'Room requires a password', passwordRequest: true });
        if (room.hasPassword() && roomData.password !== room.getPassword()) return callback({ error: 'Room password is incorrect', passwordRequest: true });
        currentRoom = room.id;
        user = new User(socket.id, `User ${room.getUsers().length + 1}`);
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
  
        this.io.emit('updateRoom', roomDataToSend);
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
          this.Rooms.getRoomById(id).convertTorrent(path.join(__dirname, './test/test.mkv'));
          break;
        case 3:
          this.Rooms.getRoomById(id).convertTorrent(path.join(__dirname, './test/test.mp4'));
          break;
        case 4:
          this.Rooms.getRoomById(id).convertTorrent(path.join(__dirname, './test/test.avi'));
          break;
        case 5:
          this.Rooms.getRoomById(id).convertTorrent(path.join(__dirname, './test/test.mov'));
          break;
        }
      });
    });
  }
}

export default SocketServer;