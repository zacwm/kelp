import * as React from 'react';
import type { Socket } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { SnackbarProvider, useSnackbar } from 'notistack';

import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Slider from '@mui/material/Slider';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

type Props = {
  socket: Socket;
  roomData: any;
  menuVisible: boolean;
  toggleMenu: () => void;
}

const Player: React.FC<Props> = ({ socket, roomData, menuVisible, toggleMenu }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [videoData, setVideoData] = React.useState(null);
  const [videoState, setVideoState] = React.useState(null);
  const refVideoStateCheckTimeout = React.useRef(null);

  const [videoTimePosition, setVideoTimePosition] = React.useState(0);

  const [mouseOverVideo, setMouseOverVideo] = React.useState(false);
  const [mouseRecentMove, setMouseRecentMove] = React.useState(false);
  const [mouseOverControls, setMouseOverControls] = React.useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = React.useState(false);

  const [inputVolumeSlider, setInputVolumeSlider] = React.useState<number>(50);

  const refPlayer = React.useRef<ReactPlayer>(null);

  let mouseStopTimeout = null;
  React.useEffect(() => {
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
  }, []);

  React.useEffect(() => {
    if (!roomData) return;
    if (mouseOverControls) return setShowVideoOverlay(true);
    setShowVideoOverlay(mouseOverVideo && mouseRecentMove);
  }, [mouseOverVideo, mouseRecentMove, mouseOverControls]);

  React.useEffect(() => {
    if (!roomData) return;
    setVideoData(roomData.videoData);
    setVideoState({
      ...roomData.videoState,
      updated: Date.now(),
    });
  }, [roomData]);

  // Socket events
  React.useEffect(() => {
    if (!roomData) return;
    if (!socket) return;

    const videoUpdateData = (data: any) => {
      if (data.roomId !== roomData.id) return;
      setVideoData(data.newData);
    };

    const videoUpdateState = (data: any) => {
      if (data.roomId !== roomData.id) return;
      setVideoState({
        ...data.newState,
        updated: Date.now(),
      });
    };

    const videoUpdateTimePosition = (data: any) => {
      if (data.roomId !== roomData.id) return;
      if (!refPlayer) return;

      refPlayer.current.seekTo(data.newTimePosition);
    };

    socket.on('videoUpdateData', videoUpdateData);
    socket.on('videoUpdateState', videoUpdateState);
    socket.on('videoUpdateTimePosition', videoUpdateTimePosition);

    return () => {
      socket.off('videoUpdateData', videoUpdateData);
      socket.off('videoUpdateState', videoUpdateState);
      socket.off('videoUpdateTimePosition', videoUpdateTimePosition);
    };
  }, [roomData, socket]);

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

  const playerOnProgress = ({ playedSeconds, played }: any) => {
    if (!videoData) return;
    if (!videoState) return;
    if (!refPlayer) return;

    if (playedSeconds > videoState.timePosition + 2) {
      refPlayer.current.seekTo(videoState.timePosition);
      enqueueSnackbar('Your player was over 2 seconds ahead. Resyncing...', { variant: 'warning' });
    } else if (playedSeconds < videoState.timePosition - 2) {
      refPlayer.current.seekTo(videoState.timePosition);
      enqueueSnackbar('Your player was over 2 seconds behind. Resyncing...', { variant: 'warning' });
    }

    setVideoTimePosition(played);
  };

  const playerEnded = () => {
    if (!videoData) return;
    if (!videoState) return;

    socket.emit('videoEndedEvent', {
      id: roomData.id,
    });
  };

  const playerOnError = (error: any) => {
    console.error(error);
    enqueueSnackbar('Something went wrong with the video. Try refreshing?', { variant: 'error' });
  };

  // User Events

  const volumeSliderChange = (event: Event, newValue: number | number[]) => {
    if (!videoData) return;
    setInputVolumeSlider(newValue as number);
  };

  // - Play/pause
  const buttonPlayback = () => {
    socket.emit('videoChangePlaybackPlaying', {
      id: roomData.id,
    }, !videoState.playing);
  };
  
  return (
    <Box>
      <Box sx={{
        background: 'black',
        position: 'relative',
      }}>
        <Stack
          direction="column"
          alignItems="stretch"
          justifyContent="center"
          sx={{
            height: '100vh',
          }}
        >
          {videoData?.url ? (
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
                      <Typography>
                        {videoData.title || 'No Title'}
                      </Typography>
                      {
                        menuVisible ? (
                          <ArrowForwardIosIcon 
                            onClick={toggleMenu}
                            sx={{
                              cursor: 'pointer',
                            }}
                          />
                        ) : (
                          <ArrowBackIosIcon 
                            onClick={toggleMenu}
                            sx={{
                              cursor: 'pointer',
                            }}
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
                      <Stack spacing={2} direction="row" sx={{ mb: 1, flex: 1 }} alignItems="center">
                        <Slider
                          aria-label="time-indicator"
                          value={videoTimePosition}
                          defaultValue={0}
                          min={0}
                          max={0.999999}
                          step={0.0001}
                          disabled
                        />
                      </Stack>
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
                    </Stack>
                  </Box>
                </Box>
              </Fade>
              <ReactPlayer
                ref={refPlayer}
                url={videoData.url}
                playing={videoState?.playing}
                volume={inputVolumeSlider / 100}
                width="100%"
                height="100%"

                onProgress={playerOnProgress}
                onEnded={playerEnded}
                onError={playerOnError}
              />
            </Box>
          ) : (
            <Box
              sx={{
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),url(/novideo.gif)',
                height: '100vh',
                width: '100%',
              }}
            >
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                  height: '100%',
                }}
              >
                {videoData?.preparing && (
                  <Paper elevation={2} sx={{ p: 2, m: 1, minWidth: 400 }}>
                    <Typography variant="h4" component="h4" mb={2}>
                      Preparing room...
                    </Typography>
                    <Typography variant="h6" component="h6" mb={1}>
                      Status: {videoData.stage}
                    </Typography>
                    { videoData.percentage && ( <LinearProgressWithLabel value={videoData.percentage} /> ) }
                  </Paper>
                )}
              </Stack>
            </Box>
          )}
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