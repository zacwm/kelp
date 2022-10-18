import * as SocketIO from 'socket.io';
import RoomManager from '../RoomManager';
import User from '../User';

export interface SocketManagerProps {
  // Part of the SocketServer class.
  io: SocketIO.Server;
  Rooms: RoomManager;

  // Specific to the socket connection.
  socket: SocketIO.Socket;
  user: User;
  setUser: (user: User) => void;
  currentRoom: string;
  setCurrentRoom: (roomId: string) => void;
}