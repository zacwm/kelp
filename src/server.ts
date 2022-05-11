// kelp - Server
import 'dotenv/config';
import path from 'path';
import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as SocketIO from 'socket.io';
import Room from './RoomManager/Room';
import RoomManager from './RoomManager';
import User from './User';

const port: number = process.env.PORT || 3000;
const nextApp = next({ dev: process.env.DEV_MODE || false });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
  
  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: SocketIO.Server = new SocketIO.Server();
  
  app.use(express.static(path.join(__dirname, './public')));
  io.attach(server);
  
  const Rooms = new RoomManager(io);
  /* # Endpoints for torrent files and subtitles will be here 
  app.get('/hello', async (_: Request, res: Response) => {
      res.send('Hello World');
  });
  */

  // TODO: Test stream host, remove when done
  app.use('/streams', express.static(path.join(__dirname, './streams')));

  io.on('connection', (socket: SocketIO.Socket) => {
    let user;
    let currentRoom;

    io.emit('allRooms', Rooms.getRoomList());

    socket.on('disconnect', () => {
      if (!currentRoom) return;
      Rooms.getRoomById(currentRoom).removeUser(user.id);
    });

    // Room related events
    socket.on('createRoom', (roomData: any, callback: any) => {
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
      const room: Room = Rooms.createRoom(roomData.name, roomData.password);
      callback({ roomId: room.id });

      io.emit('allRooms', Rooms.getRoomList());
    });

    socket.on('joinRoom', (roomData: any, callback: any) => {
      const room: Room = Rooms.getRoomById(roomData.id);
      if (!room) return callback({ error: 'Room does not exist', roomNotFound: true });
      if (room.hasPassword() && (!roomData.password || roomData.password === '')) return callback({ error: 'Room requires a password', passwordRequest: true });
      if (room.hasPassword() && roomData.password !== room.getPassword()) return callback({ error: 'Room password is incorrect', passwordRequest: true });
      currentRoom = room.id;
      user = new User(socket.id);
      room.addUser(user);
      callback({ room: {
        id: room.id,
        name: room.name,
        users: room.getUsers().map(user => {
          return {
            name: user.name || null,
          };
        }),
        videoData: room.getVideoData(),
        videoState: room.status === 'ready' ? room.getPlaybackState() : null,
      } });
    });

    socket.on('videoChangePlaybackPlaying', (roomData: any, playing: boolean) => {
      if (currentRoom !== roomData.id) return;

      Rooms.getRoomById(currentRoom).setPlaying(playing);
    });

    socket.on('videoChangePlaybackTime', (roomData: any, time: number) => {
      if (currentRoom !== roomData.id) return;

      Rooms.getRoomById(currentRoom).setTimePosition(time);
      io.emit('videoUpdateTimePosition', { roomId: roomData.id, newTimePosition: time });
    });

    socket.on('videoChangePlayback', (roomData: any, playing: boolean) => {
      if (currentRoom !== roomData.id) return;

      Rooms.getRoomById(currentRoom).setPlaying(playing);
    });

    socket.on('videoEndedEvent', (roomData: any) => {
      if (currentRoom !== roomData.id) return;

      Rooms.getRoomById(currentRoom).runEndEvent();
    });

    // Testing sockets
    socket.on('playerTest', (id: string, type: number) => {
      switch (type) {
      case 0:
        Rooms.getRoomById(id).setStatus('Downloading torrent', 50);
        break;
      case 1:
        Rooms.getRoomById(id).setStatus('ready', 100);
        break;
      }
    });
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});