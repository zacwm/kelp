import * as React from 'react';
import type { Socket } from 'socket.io-client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

type Props = {
  socket: Socket;
  roomData: any;
  videoData: any;
  videoState: any;
  menuVisible: boolean;
  toggleMenu: (forceValue?: boolean) => void;
  setMouseOverControls: (value: boolean) => void;
  videoTimePosition: number;
  videoPlayedSeconds: number;
  videoDuration: number;
  inputVolumeSlider: number;
  setInputVolumeSlider: (value: number) => void;
  setMouseRecentMove: (value: boolean) => void;
};

const PlayerControls: React.FC<Props> = ({
  socket,
  roomData,
  videoData,
  videoState,
  menuVisible,
  toggleMenu,
  setMouseOverControls,
  videoPlayedSeconds,
  videoDuration,
  inputVolumeSlider,
  setInputVolumeSlider,
  setMouseRecentMove,
}) => {

  const [fullscreenMode, setFullscreenMode] = React.useState(false);
  
  let mouseStopTimeout = null;
  React.useEffect(() => {
    if (!window) return;
    const onMouseMove = () => {
      if (mouseStopTimeout) clearTimeout(mouseStopTimeout);
      setMouseRecentMove(true);
      
      mouseStopTimeout = setTimeout(() => {
        setMouseRecentMove(false);
      }, 3000);
    };

    window.addEventListener('mousemove', onMouseMove, false);

    return () => {
      window.removeEventListener('mousemove', onMouseMove, false);
    };
  }, [window]);

  React.useEffect(() => {
    if (fullscreenMode && !document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      toggleMenu(false);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      toggleMenu(true);
    }
  }, [fullscreenMode]);

  const volumeSliderChange = (event: Event, newValue: number | number[]) => {
    if (!videoData) return;
    setInputVolumeSlider(newValue as number);
  };

  const buttonPlayback = () => {
    socket.emit('videoChangePlaybackPlaying', {
      id: roomData.id,
    }, !videoState.playing);
  };

  return (
    <Box>
      <Box sx={{
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
        padding: 2,
      }}
      onMouseEnter={() => setMouseOverControls(true) }
      onMouseLeave={() => setMouseOverControls(false) }
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography color={!videoData.title ? 'primary' : 'default'}>
            {videoData.title || 'kelp'}
          </Typography>
          {
            menuVisible ? (
              <ArrowForwardIosIcon 
                onClick={() => { toggleMenu(); }}
                sx={{ cursor: 'pointer' }}
              />
            ) : (
              <ArrowBackIosIcon 
                onClick={() => { toggleMenu(); }}
                sx={{ cursor: 'pointer' }}
              />
            )
          }
        </Stack>
      </Box>
      <Box sx={{
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
        padding: 2,
      }}
      onMouseEnter={() => setMouseOverControls(true) }
      onMouseLeave={() => setMouseOverControls(false) }
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          {
            videoState && (
              videoState.playing ? (
                <PauseIcon
                  onClick={buttonPlayback}
                  sx={{
                    cursor: 'pointer',
                  }}
                />
              ) : (
                <PlayArrowIcon
                  onClick={buttonPlayback}
                  sx={{
                    cursor: 'pointer',
                  }}
                />
              )
            )
          }
          <Typography>
            {videoPlayedSeconds !== 0 && formatSeconds(videoPlayedSeconds)}
          </Typography>
          <Stack spacing={2} direction="row" sx={{ mb: 1, flex: 1 }} alignItems="center">
            <Slider
              aria-label="time-indicator"
              value={videoPlayedSeconds || 0}
              defaultValue={0}
              min={0}
              max={videoDuration || 0}
              step={1}
            />
          </Stack>
          <Typography>
            {formatSeconds(videoDuration || 0)}
          </Typography>
          <Stack spacing={2} direction="row" sx={{ mb: 1, minWidth: 200 }} alignItems="center">
            <VolumeDown />
            <Slider
              aria-label="Volume"
              value={inputVolumeSlider}
              onChange={volumeSliderChange}
              valueLabelDisplay="auto"
            />
            <VolumeUp />
          </Stack>
          <FullscreenIcon 
            onClick={() => setFullscreenMode(!fullscreenMode)}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default PlayerControls;

function formatSeconds(seconds) {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function pad(string) {
  return ('0' + string).slice(-2);
}