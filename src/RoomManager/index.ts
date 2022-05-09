import Room from './Room';

interface RoomManagerInterface {
  getRoomList(): any[];
  createRoom(name: string): Room;
  getRoomById(id: string): Room;
}

class RoomManager implements RoomManagerInterface {
  private rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  getRoomList(): any {
    return this.rooms.map(room => {
      return {
        id: room.id,
        name: room.name,
        hasPassword: room.hasPassword(),
        status: 'unknown',
      };
    });
  }

  createRoom(name: string, password?: string): Room {
    const newRoom = new Room(name, password);
    this.rooms.push(newRoom);
    return newRoom;
  }

  getRoomById(id: string): Room {
    return this.rooms.find(room => room.id === id);
  }
}

export default RoomManager;