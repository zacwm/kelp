// [videoChangePlaybackTime] Change video playback time
// Used on seek bar change by user.
// TODO: Should add a user event announcement.

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoChangePlaybackTime(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    io,
    Rooms,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [roomData, time] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  if (currentRoom !== roomData.id) return;
  
  const room = Rooms.getRoomById(currentRoom);
  room.setTimePosition(time);
  
  // TODO: Change this so it only sends to the room.
  io.emit('videoUpdateTimePosition', { roomId: roomData.id, newTimePosition: time });

  room.createEvent(`seeked through the video.`, user.name);
}