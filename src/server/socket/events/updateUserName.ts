// [updateUserName] Update User Name
// Updates the user's name.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function updateUserName(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    Rooms,
    socket,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [data] = args;

  // Validation check that the user is in the room it's trying to update.
  if (currentRoom !== data.roomId) return;

  const room: Room = Rooms.getRoomById(data.roomId);
  
  if (!room || !user) return;
  Rooms.getRoomById(data.roomId).updateUserName(socket.id, data.name.substring(0, 15));
}