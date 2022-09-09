// [closeRoom] Close room
// Bye bye room...

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../RoomManager/Room';

export default function closeRoom(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms }: SocketManagerProps = socketManager;
  const [roomId] = args;

  // TODO: Add a check to see if the user has permission to reset the room.
  // 'permission' will be a room array of user ids that have the 'controller' as well as a value of the 'host'.

  const room: Room = Rooms.getRoomById(roomId);

  Rooms.closeRoom(room);
}