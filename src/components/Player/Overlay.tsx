import * as React from 'react';

import { useSocket } from 'contexts/socket.context';
import { useRoom } from 'contexts/room.context';
import { useVideo } from 'contexts/video.context';

import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

import { Box, Slider, Group, Stack, Text } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlay, faPause, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

type Props = {
  show: boolean;
  setMouseOverControls: any;
  videoState: any;
  setFullscreenMode: any;
  fullscreenMode: boolean;
  videoPlayedSeconds: number;
  videoDuration: number;
  setVideoPlayedSeconds: any;
  inputVolumeSlider: number;
  setInputVolumeSlider: any;
  setSliderEndPosition: any;
}

const Overlay: React.FC<Props> = ({
  show,
  setMouseOverControls,
  videoState,
  setFullscreenMode,
  fullscreenMode,
  videoPlayedSeconds,
  videoDuration,
  setVideoPlayedSeconds,
  inputVolumeSlider,
  setInputVolumeSlider,
  setSliderEndPosition,
}) => {
  const { socket } = useSocket();
  const { room } = useRoom();
  const { video } = useVideo();

  const buttonPlayback = () => {
    socket.emit('videoChangePlaybackPlaying', {
      id: room.id,
    }, !videoState.playing);
  };

  return (
    <Fade in={show ? true : false}>
      <Box>
        <Box sx={{
          position: 'absolute',
          zIndex: 100,
          top: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
          padding: '30px',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setMouseOverControls(true) }
        onMouseLeave={() => setMouseOverControls(false) }
        >
          <Group
            align="center"
            position="left"
            spacing={0}
          >
            <Box
              sx={{
                zIndex: 1000,
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <FontAwesomeIcon 
                icon={faArrowLeft}
                onClick={() => {
                  // TODO: Display some confirmation dialog first
                  socket.emit('resetRoom', room.id);
                }}
              />
            </Box>
            <Text
              sx={{
                lineHeight: 1,
                marginLeft: '30px',
                fontSize: 24,
              }}
            >
              {video.title || 'kelp'}
            </Text>
          </Group>
        </Box>

        {/* Playing button for when paused */}
        <Fade in={!videoState?.playing}>
          <Group
            align="center"
            position="center"
            sx={{
              position: 'absolute',
              zIndex: 1,
              top: 0,
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <FontAwesomeIcon 
              icon={faPlay} 
              style={{ 
                fontSize: 50,
                cursor: 'pointer',
              }}
              onClick={buttonPlayback}
            />
          </Group>
        </Fade>

        {/* Bottom controls */}
        <Box sx={{
          position: 'absolute',
          zIndex: 100,
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
          padding: '30px',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setMouseOverControls(true) }
        onMouseLeave={() => setMouseOverControls(true) }
        >
          <Stack spacing={0}>
            <Slider
              aria-label="time-indicator"
              value={videoPlayedSeconds}
              min={0}
              max={videoDuration || 0}
              step={1}
              label={formatSeconds(videoPlayedSeconds || 0)}
              onChange={setVideoPlayedSeconds}
              onChangeEnd={setSliderEndPosition}
            />
            <Group
              align="center"
              position="apart"
              spacing={2}
              sx={{
                padding: '30px 30px 0 30px',
              }}
            >
              <Group>
                {
                  videoState && (
                    <FontAwesomeIcon 
                      icon={videoState.playing ? faPause : faPlay} 
                      style={{ 
                        fontSize: 23,
                        cursor: 'pointer',
                      }}
                      onClick={buttonPlayback}
                    />
                  )
                }
                <Group
                  sx={{
                    width: '150px',
                  }}
                >
                  <Slider
                    aria-label="Volume"
                    value={inputVolumeSlider}
                    onChange={setInputVolumeSlider}
                    sx={{ width: '100%' }}
                  />
                </Group>
                <Text color="kelpPalette.5">
                  {formatSeconds(videoPlayedSeconds || 0)} / {formatSeconds(videoDuration || 0)}
                </Text>
              </Group>
              <Group>
                <FontAwesomeIcon 
                  icon={fullscreenMode ? faCompress : faExpand} 
                  style={{ 
                    fontSize: 23,
                    cursor: 'pointer',
                  }}
                  onClick={() => setFullscreenMode(!fullscreenMode)}
                />
              </Group>
            </Group>
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
};

export default Overlay;

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