// [videoSelectFile] Video Select File
// Allows selecting files from torrents after they're downloaded...
// TODO: This may change or even be removed, as I'm (zachary) looking
// TODO| into a selection to only download the file they need from a torrent.

import { SocketManagerProps } from '../SocketManagerProps';
import Room from '../../Room';

export default function videoSelectFile(socketManager: SocketManagerProps, ...args: any[]): void {
  const {
    Rooms,
    user,
    currentRoom,
  }: SocketManagerProps = socketManager;
  const [data] = args;

  if (!user) return;
  if (!['host', 'controller'].includes(user.permission)) return;

  if (currentRoom !== data.roomId) return;

  const room: Room = Rooms.getRoomById(data.roomId);
  if (!room) return;

  // Find and return the file specified.
  const videoFile = (room.files || []).find(file => file.id === data.fileId);
  if (!videoFile) return;
  
  // Begin the file ffmpeg conversion and play the file (if file exists);
  room.convertFile(videoFile.path);
}