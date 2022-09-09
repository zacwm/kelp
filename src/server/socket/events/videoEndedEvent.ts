// [videoEndedEvent] End of video event.
// Used to check if the video is finished.
// TODO: Have it only be accepted as end of video by a permissioned user.

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoEndedEvent(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, currentRoom }: SocketManagerProps = socketManager;
  const [roomData] = args;

  if (currentRoom !== roomData.id) return;
  
  Rooms.getRoomById(currentRoom).runEndEvent();
}