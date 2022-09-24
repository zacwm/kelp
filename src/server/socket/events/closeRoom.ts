// [closeRoom] Close room
// Bye bye room...

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function closeRoom(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, user }: SocketManagerProps = socketManager;
  const [roomId] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  const room: Room = Rooms.getRoomById(roomId);

  Rooms.closeRoom(room);
}