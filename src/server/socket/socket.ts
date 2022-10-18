import * as SocketIO from 'socket.io';
import RoomManager from '../RoomManager';
import User from '../User';

import eventImports from './eventImports';

class SocketServer {
  private io: SocketIO.Server;
  public Rooms: RoomManager;

  constructor(ioServer: SocketIO.Server) {
    this.io = ioServer;
    this.Rooms = new RoomManager(this.io);
    
    this.io.on('connection', (socket: SocketIO.Socket) => {
      let user;
      let currentRoom;

      // New prep listeners from eventImports
      Object.keys(eventImports).forEach((eventName: string) => {
        const event = eventImports[eventName];
        socket.on(eventName, (...args: any[]) => event({
          io: this.io,
          Rooms: this.Rooms,
          socket,
          user,
          setUser: (newUser: User) => user = newUser,
          currentRoom,
          setCurrentRoom: (roomId: string) => currentRoom = roomId,
        }, ...args));
      });

      this.io.emit('getRoomsList', this.Rooms.getRoomList());
    });
  }
}

export default SocketServer;