import * as React from 'react';
import type { Socket } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useCookies } from 'react-cookie';

import { useRoom } from '../contexts/room.context';
import { useVideo } from '../contexts/video.context';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import { Box, ActionIcon, Slider } from '@mantine/core';

import { IconArrowLeft, IconPlayerPlay } from '@tabler/icons';

type Props = {
  socket: Socket;
  videoState: any;
  setVideoState: any;
  toggleMenu: (forceValue?: boolean) => void;
}

const Player: React.FC<Props> = ({ socket, videoState, setVideoState, toggleMenu }) => {
  const [cookies, setCookie] = useCookies(['kelp-volume']);
  const { room } = useRoom();
  const { video } = useVideo();

  const { enqueueSnackbar } = useSnackbar();

  const refVideoStateCheckTimeout = React.useRef(null);

  const [videoPlayedSeconds, setVideoPlayedSeconds] = React.useState(0);
  const [videoDuration, setVideoDuration] = React.useState(0);
  const [sliderEndPosition, setSliderEndPosition] = React.useState(0);

  const [mouseOverVideo, setMouseOverVideo] = React.useState(false);
  const [mouseRecentMove, setMouseRecentMove] = React.useState(false);
  const [mouseOverControls, setMouseOverControls] = React.useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = React.useState(false);

  const [inputVolumeSlider, setInputVolumeSlider] = React.useState<number>(50);
  const [fullscreenMode, setFullscreenMode] = React.useState(false);

  const refPlayer = React.useRef<ReactPlayer>(null);

  // Hover controls manager
  let mouseStopTimeout = null;
  React.useEffect(() => {
    const onMouseMove = () => {
      if (mouseStopTimeout) clearTimeout(mouseStopTimeout);
      setMouseRecentMove(true);
      mouseStopTimeout = setTimeout(() => {
        setMouseRecentMove(false);
      }, 3000);
    };

    try {
      const savedVol = !isNaN(cookies['kelp-volume']) ? parseInt(cookies['kelp-volume']) : 50;
      setInputVolumeSlider(savedVol);
    } catch (exception) {
      console.warn('Cookie had a valid key property, but failed on parsing.');
      console.warn(exception);
    }

    window.addEventListener('mousemove', onMouseMove, false);

    return () => {
      window.removeEventListener('mousemove', onMouseMove, false);
    };
  }, []);

  React.useEffect(() => {
    if (!room) return;
    if (mouseOverControls) return setShowVideoOverlay(true);
    setShowVideoOverlay(mouseOverVideo && mouseRecentMove);
  }, [mouseOverVideo, mouseRecentMove, mouseOverControls]);

  // Socket events
  React.useEffect(() => {
    if (!room) return;
    if (!socket) return;

    const videoUpdateTimePosition = (data: any) => {
      if (data.roomId !== room.id) return;
      if (!refPlayer?.current) return;

      refPlayer.current.seekTo(data.newTimePosition);
    };

    const socketNotify = (data: any) => {
      if (data.roomId !== room.id) return;
      enqueueSnackbar(data.message, { variant: data.variant, autoHideDuration: data.autoHideDuration });
    };

    socket.on('videoUpdateTimePosition', videoUpdateTimePosition);
    socket.on('notify', socketNotify);

    return () => {
      socket.off('videoUpdateTimePosition', videoUpdateTimePosition);
      socket.off('notify', socketNotify);
    };
  }, [room, socket]);


  // Fullscreen manager
  React.useEffect(() => {
    if (fullscreenMode && !document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      toggleMenu(false);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      toggleMenu(true);
    }
  }, [fullscreenMode]);

  // If video state is playing but hasn't been updated for 2 seconds, pause it.
  React.useEffect(() => {
    if (!videoState) return;
    if (!videoState.playing) {
      if (refVideoStateCheckTimeout.current) clearTimeout(refVideoStateCheckTimeout.current);
      return;
    }

    if (refVideoStateCheckTimeout.current) clearTimeout(refVideoStateCheckTimeout.current);
    refVideoStateCheckTimeout.current = setTimeout(() => {
      if (!videoState.updated) return;
      if (videoState.updated + 2000 < Date.now()) {
        setVideoState({
          ...videoState,
          playing: false,
        });
        enqueueSnackbar('Server hasn\'t responded with syncing data for over 2 seconds... Video has been paused.', {
          variant: 'error',
          autoHideDuration: 10000,
        });
      }
    }, 2000);
  }, [videoState]);

  React.useEffect(() => {
    socket.emit('videoChangePlaybackTime', {
      id: room.id,
    }, sliderEndPosition);
  }, [sliderEndPosition]);

  React.useEffect(() => {
    setCookie('kelp-volume', inputVolumeSlider, { path: '/' });
  }, [inputVolumeSlider, video]);

  const playerOnReady = () => {
    if (!video) return;
    if (!videoState) return;
    if (!refPlayer) return;

    const hls = refPlayer.current.getInternalPlayer('hls');
    console.log(hls.audioTracks);
    console.log(hls.audioTrack);
    hls.audioTrack = hls.audioTracks[1];
  };

  const playerOnProgress = ({ playedSeconds }: any) => {
    if (!video) return;
    if (!videoState) return;
    if (!refPlayer) return;

    if (Math.floor(playedSeconds) > videoState.timePosition + 2) {
      refPlayer.current.seekTo(videoState.timePosition);
      enqueueSnackbar('Your player was over 2 seconds ahead. Resyncing...', { variant: 'warning' });
    } else if (Math.floor(playedSeconds) < videoState.timePosition - 2) {
      refPlayer.current.seekTo(videoState.timePosition);
      enqueueSnackbar('Your player was over 2 seconds behind. Resyncing...', { variant: 'warning' });
    }

    setVideoPlayedSeconds(playedSeconds);
  };

  const playerEnded = () => {
    if (!video) return;
    if (!videoState) return;

    socket.emit('videoEndedEvent', {
      id: room.id,
    });
  };

  const playerOnError = (error: any) => {
    console.error(error);
    enqueueSnackbar('Something went wrong with the video. Try refreshing?', { variant: 'error' });
  };

  const playerOnDuration = (duration: number) => {
    setVideoDuration(duration);
  };

  // - Play/pause
  const buttonPlayback = () => {
    socket.emit('videoChangePlaybackPlaying', {
      id: room.id,
    }, !videoState.playing);
  };
  
  return (
    <Box sx={{
      position: 'fixed',
      height: '100vh',
      width: '100vw',
      top: 0,
      left: 0,
      overflow: 'hidden',
    }}>
      <Box sx={{
        background: 'black',
        position: 'relative',
        color: '#fff',
      }}>
        <Stack
          direction="column"
          alignItems="stretch"
          justifyContent="center"
          sx={{
            height: '100vh',
          }}
        >
          <Box
            onMouseOver={() => setMouseOverVideo(true) }
            onMouseOut={() => setMouseOverVideo(false) }
            sx={{
              height: '100%',
              width: '100%',
              cursor: showVideoOverlay ? 'default' : 'none',
            }}
          >
            <Fade in={showVideoOverlay ? true : false}>
              <Box>
                <Box sx={{
                  position: 'absolute',
                  zIndex: 100,
                  top: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
                  padding: '16px',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={() => setMouseOverControls(true) }
                onMouseLeave={() => setMouseOverControls(false) }
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-start"
                    spacing={2}
                  >
                    <ActionIcon
                      size="lg"
                      onClick={() => {
                        // TODO: Display some confirmation dialog first
                        socket.emit('resetRoom', room.id);
                      }}
                      sx={{ zIndex: 1000 }}
                    >
                      <IconArrowLeft />
                    </ActionIcon>
                    <Typography color={!video.title ? 'primary' : 'default'}>
                      {video.title || 'kelp'}
                    </Typography>
                  </Stack>
                </Box>
                <Fade in={!videoState?.playing}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      position: 'absolute',
                      zIndex: 1,
                      top: 0,
                      height: '100%',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <ActionIcon size={120} onClick={buttonPlayback}>
                      <IconPlayerPlay size={100} />
                    </ActionIcon>
                  </Stack>
                </Fade>
                <Box sx={{
                  position: 'absolute',
                  zIndex: 100,
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)',
                  padding: '16px',
                  boxSizing: 'border-box',
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
                    <Stack spacing={2} direction="row" sx={{ mb: 1, flex: 1 }} alignItems="center">
                      <Slider
                        aria-label="time-indicator"
                        value={videoPlayedSeconds}
                        min={0}
                        max={videoDuration || 0}
                        step={1}
                        sx={{ width: '100%' }}
                        label={formatSeconds(videoPlayedSeconds || 0)}
                        onChange={setVideoPlayedSeconds}
                        onChangeEnd={setSliderEndPosition}
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
                        onChange={setInputVolumeSlider}
                        sx={{ width: '100%' }}
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
            </Fade>
            <ReactPlayer
              ref={refPlayer}
              url={video.url}
              config={{
                file: {
                  tracks: [
                    {
                      label: 'subtitles',
                      kind: 'subtitles',
                      src: video.subtitle,
                      srcLang: 'en',
                      default: true,
                    },
                  ],
                }
              }}
              playing={videoState?.playing}
              volume={inputVolumeSlider / 100}
              width="100%"
              height="100%"

              onReady={playerOnReady}
              onProgress={playerOnProgress}
              onEnded={playerEnded}
              onError={playerOnError}
              onDuration={playerOnDuration}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

const NotistackIntegration: React.FC<Props> = (props) => {
  return (
    <SnackbarProvider
      maxSnack={8}
      hideIconVariant={true}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Player {...props} />
    </SnackbarProvider>
  );
};

export default NotistackIntegration;

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