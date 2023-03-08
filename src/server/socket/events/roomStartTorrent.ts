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
  if (room?.status?.type !== 'waiting') return;

  room.startTorrent({ url: data.url, file: data.file, name: data.name }, callback);
  room.createEvent('started a torrent download.', user.name);
}