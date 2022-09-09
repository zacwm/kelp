// [getRoomSummary] Get Room Summary
// Returns a summary of a room, used mainly for the pre-join room information.
// But could be used for other things later on, idk.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../RoomManager/Room';

export default function getRoomSummary(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms }: SocketManagerProps = socketManager;
  const [roomId, callback] = args;

  const room: Room = Rooms.getRoomById(roomId);
  if (!room) return callback({ error: 'Room does not exist' });
  callback({
    id: room.id,
    name: room.name,
    hasPassword: room.hasPassword(),
  });
}