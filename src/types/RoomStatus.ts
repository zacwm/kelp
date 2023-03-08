export interface RoomStatus {
  type: 'waiting' | 'playing' | 'error' | 'starting' | 'downloading' | 'processing' | 'resetting';
  message: string;
  percentage: number | null;
  timeRemaining: number | null;
  speed: string | null;
  peers: number | null;
}

// Some pre defined room statuses.
interface RoomStatusPresets {
  [key: string]: RoomStatus;
}

export const RoomStatusPresets: RoomStatusPresets = {
  WAITING: {
    type: 'waiting',
    message: 'Finding something to watch...',
    percentage: null,
    timeRemaining: null,
    speed: null,
    peers: null,
  },
  STARTING: {
    type: 'starting',
    message: 'Starting the download...',
    percentage: null,
    timeRemaining: null,
    speed: null,
    peers: null,
  },
  RESETTING: {
    type: 'resetting',
    message: 'Resetting the room...',
    percentage: null,
    timeRemaining: null,
    speed: null,
    peers: null,
  },
};