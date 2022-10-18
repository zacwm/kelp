// [disconnect] Disconnect
// An event by Socket.IO that runs on any sort of disconnect.
// We use this to remove the user from the room they were in.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function createRoom(socketManager: SocketManagerProps, ...args: any[]): void {
  const { io, Rooms }: SocketManagerProps = socketManager;
  const [roomData, callback] = args;

  if (Rooms.getRoomCount() >= parseInt(process.env.ROOM_LIMIT)) return callback({ error: 'Room limit reached... Wait till rooms have closed...' });
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

  io.emit('getRoomsList', Rooms.getRoomList());
}