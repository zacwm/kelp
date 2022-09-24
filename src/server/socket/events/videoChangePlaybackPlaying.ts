// [videoChangePlaybackPlaying] Video Change Playback Playing
// Seems to be the same as 'videoChangePlayback' but is the one that
// determines who is using it to show the announcement.
// TODO: Check 'videoChangePlayback' todo comment...

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoChangePlaybackPlaying(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    Rooms,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [roomData, playing] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  if (currentRoom !== roomData.id) return;
  
  Rooms.getRoomById(currentRoom).setPlaying(playing, user.name);
}