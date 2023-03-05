// [hostToggleController] Host Toggle Controller
// Host toggling if a user has controller permissions.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default async function hostToggleController(socketManager: SocketManagerProps, ...args: any[]): Promise<void> {
  const {
    io,
    Rooms,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [userId] = args;

  if (!user) return;
  if (user.permission !== 'host') return;

  const room: Room = Rooms.getRoomById(currentRoom);
  if (!room) return;

  const targetUser = room.getUsers().find((u) => u.id === userId);
  if (!targetUser) return;

  if (targetUser.permission === 'controller') {
    targetUser.setPermission('viewer');
  } else {
    targetUser.setPermission('controller');
  }

  // Update for all users in room.
  io.to(room.id).emit('updateRoom', {
    id: room.id,
    name: room.name,
    users: room.getUsers(),
    videoData: room.getVideoData(),
    videoState: room.status?.type == 'playing' ? room.getPlaybackState() : null,
  });
}