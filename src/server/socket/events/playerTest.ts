// [playerTest] Player Test
// Some dev stuff to test the player.

import { SocketManagerProps } from '../SocketManagerProps';
import path from 'path';

export default function playerTest(socketManager: SocketManagerProps, ...args: any[]): void {
  const { Rooms }: SocketManagerProps = socketManager;
  const [id, type] = args;

  switch (type) {
  case 1:
    Rooms.getRoomById(id).resetRoom();
    break;
  case 2:
    Rooms.getRoomById(id).convertFile(path.join(__dirname, '../../../test/test.mkv'));
    break;
  case 3:
    Rooms.getRoomById(id).convertFile(path.join(__dirname, '../../../test/test.mp4'));
    break;
  case 4:
    Rooms.getRoomById(id).convertFile(path.join(__dirname, '../../../test/test.avi'));
    break;
  case 5:
    Rooms.getRoomById(id).convertFile(path.join(__dirname, '../../../test/test.mov'));
    break;
  }
}