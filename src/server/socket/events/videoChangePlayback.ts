// [videoChangePlayback] Change Playback of Video
// Changes if the video is playing or not.
// TODO: Need to invesitgate if this is needed along with 'videoChangePlaybackPlaying'...

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoChangePlayback(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    Rooms,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [roomData, playing] = args;

  if (currentRoom !== roomData.id) return;
  
  Rooms.getRoomById(currentRoom).setPlaying(playing);
}