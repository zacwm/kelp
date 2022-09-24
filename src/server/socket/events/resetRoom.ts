// [resetRoom] Reset room
// It just resets the room...

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function resetRoom(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, user }: SocketManagerProps = socketManager;
  const [roomId] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  const room: Room = Rooms.getRoomById(roomId);

  room.resetRoom();
}