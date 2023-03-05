import Room from './Room';
import * as SocketIO from 'socket.io';

interface RoomManagerInterface {
  getRoomList(): any[];
  createRoom(name: string): Room;
  getRoomById(id: string): Room;
  getRoomCount(): number;
  closeRoom(room: Room): void;
}

class RoomManager implements RoomManagerInterface {
  private SocketServer: SocketIO.Server;
  private rooms: Room[];

  constructor(SocketServer: SocketIO.Server) {
    this.SocketServer = SocketServer;
    this.rooms = [];
  }

  getRoomList(): any {
    return this.rooms.map(room => {
      return {
        id: room.id,
        name: room.name,
        hasPassword: room.hasPassword(),
        status: room.status.message,
      };
    });
  }

  createRoom(name: string, password?: string): Room {
    const newRoom = new Room(this.SocketServer, name, password);
    this.rooms.push(newRoom);
    return newRoom;
  }

  getRoomById(id: string): Room {
    return this.rooms.find(room => room.id === id);
  }

  getRoomCount(): number {
    return this.rooms.length;
  }
  
  closeRoom(room: Room): void {
    room.resetRoom(true);
    this.SocketServer.emit('roomClosed', room.id);
    this.rooms = this.rooms.filter(r => r.id !== room.id);
  }
}

export default RoomManager;