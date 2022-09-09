// [videoChangePlaybackTime] Change video playback time
// Used on seek bar change by user.
// TODO: Should add a user event announcement.

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoChangePlaybackTime(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    io,
    Rooms,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [roomData, time] = args;

  if (currentRoom !== roomData.id) return;
  
  Rooms.getRoomById(currentRoom).setTimePosition(time);
  io.emit('videoUpdateTimePosition', { roomId: roomData.id, newTimePosition: time });
}