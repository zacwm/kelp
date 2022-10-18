// [videoEndedEvent] End of video event.
// Used to check if the video is finished.

import { SocketManagerProps } from '../SocketManagerProps';

export default function videoEndedEvent(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, user, currentRoom }: SocketManagerProps = socketManager;
  const [roomData] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  if (currentRoom !== roomData.id) return;
  
  Rooms.getRoomById(currentRoom).runEndEvent();
}