import closeRoom from './events/closeRoom';
import createRoom from './events/createRoom';
import disconnect from './events/disconnect';
import getRoomSummary from './events/getRoomSummary';
import getTitleDetails from './events/getTitleDetails';
import getTitles from './events/getTitles';
import joinRoom from './events/joinRoom';
import playerTest from './events/playerTest';
import resetRoom from './events/resetRoom';
import roomStartTorrent from './events/roomStartTorrent';
import updateUserName from './events/updateUserName';
import videoChangePlayback from './events/videoChangePlayback';
import videoChangePlaybackPlaying from './events/videoChangePlaybackPlaying';
import videoChangePlaybackTime from './events/videoChangePlaybackTime';
import videoEndedEvent from './events/videoEndedEvent';
import videoSelectFile from './events/videoSelectFile';

export default {
  closeRoom,
  createRoom,
  disconnect,
  getRoomSummary,
  getTitleDetails,
  getTitles,
  joinRoom,
  playerTest,
  resetRoom,
  roomStartTorrent,
  updateUserName,
  videoChangePlayback,
  videoChangePlaybackPlaying,
  videoChangePlaybackTime,
  videoEndedEvent,
  videoSelectFile,
};