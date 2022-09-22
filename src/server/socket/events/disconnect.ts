// [disconnect] Disconnect
// An event by Socket.IO that runs on any sort of disconnect.
// We use this to remove the user from the room they were in.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

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

  // If user was host, set the next user in the room to host by checking the users join unix time.
  if (user.permission === 'host') {
    const users = room.getUsers();
    if (users.length > 0) {
      const nextHost = users.reduce((prev, current) => (prev.joinUnixTime < current.joinUnixTime) ? prev : current);
      nextHost.setPermission('host');
    }
  }

  io.emit('updateRoom', {
    id: room.id,
    name: room.name,
    users: room.getUsers(),
    videoData: room.getVideoData(),
    videoState: room.statusCode === 0 ? room.getPlaybackState() : null,
  });

}