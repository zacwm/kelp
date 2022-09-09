// [roomStartTorrent] Start Torrent
// Starts the torrent download for the room.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../RoomManager/Room';

export default function roomStartTorrent(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, currentRoom }: SocketManagerProps = socketManager;
  const [data, callback] = args;

  if (currentRoom !== data.id) return;
  
  const room: Room = Rooms.getRoomById(data.id);
  if (!room) return;

  const videoData: any = room.getVideoData();
  if (![0, 1].includes(videoData.statusCode)) return;

  room.startTorrent(data.url, callback);
}