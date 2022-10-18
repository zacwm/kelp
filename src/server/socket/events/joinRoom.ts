// [joinRoom] Join Room
// This event handles the validation of joining a room and
// will perforrm the callback of necessary data to join.

import { SocketManagerProps } from '../SocketManagerProps';
import User from '../../User';
import Room from '../../Room';

export default function joinRoom(socketManager: SocketManagerProps, ...args: any[]): void {
  const { 
    io,
    Rooms,
    socket,
    setUser,
    setCurrentRoom,
  }: SocketManagerProps = socketManager;
  const [roomData, callback] = args;

  const room: Room = Rooms.getRoomById(roomData.id);
  if (!room) return callback({ error: 'Room does not exist', roomNotFound: true });

  // NOTE: Checks if room has password, but it may not be needed after 'getRoomSummary' socket event.
  // If no password was provided, it could be because the client wasnt aware of the password requirement
  // It should know now with 'getRoomSummary'...
  if (room.hasPassword() && (!roomData.password || roomData.password === '')) return callback({
    userError: 'Room requires a password',
    hasPassword: true,
  });
  // Password was provided, but it was incorrect.
  if (room.hasPassword() && roomData.password !== room.getPassword()) return callback({
    userError: 'Room password is incorrect',
    hasPassword: true,
  });

  // If name is not greater than 0 and is over 15 characters, throw userError.
  if (roomData.name.length <= 0 || roomData.name.length > 15) return callback({ userError: 'Name must be between 1 and 10 characters' });

  // Passed checks, create user and add to room.
  const newUser = new User(socket.id, roomData.name);
  setUser(newUser);
  room.addUser(newUser);

  // If only user in room, set permission to host.
  if (room.getUsers().length === 1) {
    newUser.setPermission('host');
  }

  // Send data to clients about the new user joining and provide the user with the room data.
  const roomDataToSend: any = {
    id: room.id,
    name: room.name,
    users: room.getUsers(),
    videoData: room.getVideoData(),
    videoState: room.statusCode === 0 ? room.getPlaybackState() : null,
  };

  callback({
    user: newUser,
    room: roomDataToSend,
  });

  io.to(room.id).emit('updateRoom', roomDataToSend);
  io.to(room.id).emit('updateEvents', room.eventHistory);

  socket.join(room.id);
  setCurrentRoom(room.id);
}