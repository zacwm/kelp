// [disconnect] Disconnect
// An event by Socket.IO that runs on any sort of disconnect.
// We use this to remove the user from the room they were in.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../RoomManager/Room';

export default function disconnect(socketManager: SocketManagerProps): void {
  const {
    io,
    Rooms,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;

  if (!currentRoom) return;

  const room: Room = Rooms.getRoomById(currentRoom);
  
  // Check if the room still exists. Disconnect event still runs if the room was closed.
  if (!room) return;

  room.removeUser(user.id);

  io.emit('updateRoom', {
    id: room.id,
    name: room.name,
    users: room.getUsers().map(userItem => {
      return {
        id: userItem.id,
        name: userItem.name || null,
      };
    }),
    videoData: room.getVideoData(),
    videoState: room.statusCode === 0 ? room.getPlaybackState() : null,
  });

}