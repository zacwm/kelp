import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import Room from './RoomManager/Room';
import RoomManager from './RoomManager';

import config from '../config.json';

const port: number = config.port || 3000;
const nextApp = next({ dev: config.devMode });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
  const Rooms = new RoomManager();

  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: socketio.Server = new socketio.Server();
  io.attach(server);
  
  /* # Endpoints for torrent files and subtitles will be here 
  app.get('/hello', async (_: Request, res: Response) => {
      res.send('Hello World');
  });
  */

  io.on('connection', (socket: socketio.Socket) => {
    console.log('connection');

    io.emit('allRooms', Rooms.getRooms());

    socket.on('disconnect', () => {
      console.log('client disconnected');
    });


    socket.on('createRoom', (roomData: any, callback: any) => {
      // Validate room name...
      if (typeof roomData.name !== 'string') return callback({ error: 'Room name must be a string' });
      if (roomData.name.length < 3) return callback({ error: 'Room name must be at least 3 characters' });
      if (roomData.name.length > 20) return callback({ error: 'Room name must be at most 20 characters' });

      // Validate room password if there is one...
      if (roomData.password) {
        if (typeof roomData.password !== 'string') return callback({ error: 'Room password must be a string' });
        if (roomData.password.length < 3) return callback({ error: 'Room password must be at least 3 characters' });
        if (roomData.password.length > 20) return callback({ error: 'Room password must be at most 20 characters' });
      }
      
      // Create room...
      const room: Room = Rooms.createRoom(roomData.name, roomData.password);
      callback({ roomId: room.getId() });

      io.emit('allRooms', Rooms.getRooms());
    });
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});