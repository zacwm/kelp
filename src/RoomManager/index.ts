import Room from './Room';

interface RoomManagerInterface {
  getRooms(): Room[];
  createRoom(name: string): Room;
}

class RoomManager implements RoomManagerInterface {
  private rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  getRooms(): any {
    return this.rooms.map(room => {
      return {
        id: room.getId(),
        name: room.getName(),
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
}

export default RoomManager;