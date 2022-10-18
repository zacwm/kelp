// [roomStartTorrent] Start Torrent
// Starts the torrent download for the room.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function roomStartTorrent(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms, user, currentRoom}: SocketManagerProps = socketManager;
  const [data, callback] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  if (currentRoom !== data.id) return;
  
  const room: Room = Rooms.getRoomById(data.id);
  if (!room) return;

  const videoData: any = room.getVideoData();
  if (![0, 1].includes(videoData.statusCode)) return;

  room.startTorrent(data.url, callback);
  room.createEvent('started a torrent download.', user.name);
}