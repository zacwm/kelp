import * as React from 'react';
import type { Socket } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { SnackbarProvider, useSnackbar } from 'notistack';
import moment from 'moment';

import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

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
  videoState: any;
  setVideoState: any;
  videoData: any;
  setVideoData: any;
  toggleMenu: (forceValue?: boolean) => void;
}

const Player: React.FC<Props> = ({ socket, roomData, menuVisible, videoState, setVideoState, videoData, setVideoData, toggleMenu }) => {
  const { enqueueSnackbar } = useSnackbar();

  const refVideoStateCheckTimeout = React.useRef(null);

  const [videoTimePosition, setVideoTimePosition] = React.useState(0);
  const [videoPlayedSeconds, setVideoPlayedSeconds] = React.useState(0);
  const [videoDuration, setVideoDuration] = React.useState(0);

  const [mouseOverVideo, setMouseOverVideo] = React.useState(false);
  const [mouseRecentMove, setMouseRecentMove] = React.useState(false);
  const [mouseOverControls, setMouseOverControls] = React.useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = React.useState(false);

  const [inputVolumeSlider, setInputVolumeSlider] = React.useState<number>(50);
  const [fullscreenMode, setFullscreenMode] = React.useState(false);

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

    const socketNotify = (data: any) => {
      if (data.roomId !== roomData.id) return;
      enqueueSnackbar(data.message, { variant: data.variant, autoHideDuration: data.autoHideDuration });
    };

    socket.on('videoUpdateData', videoUpdateData);
    socket.on('videoUpdateState', videoUpdateState);
    socket.on('videoUpdateTimePosition', videoUpdateTimePosition);
    socket.on('notify', socketNotify);

    return () => {
      socket.off('videoUpdateData', videoUpdateData);
      socket.off('videoUpdateState', videoUpdateState);
      socket.off('videoUpdateTimePosition', videoUpdateTimePosition);
      socket.off('notify', socketNotify);
    };
  }, [roomData, socket]);

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

  const playerOnProgress = ({ playedSeconds, played }: any) => {
    if (!videoData) return;
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

  const playerOnDuration = (duration: number) => {
    setVideoDuration(duration);
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
          {videoData?.statusCode === 0 && videoData?.url ? (
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
                      }}
                    >
                      <PlayArrowIcon
                        sx={{
                          fontSize: 120,
                          textShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                        }}
                        onClick={buttonPlayback}
                      />
                    </Stack>
                  </Fade>
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
                      <Tooltip title="To adjust time, use the side menu." placement="top" followCursor>
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
                      </Tooltip>
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
              </Fade>
              <ReactPlayer
                ref={refPlayer}
                url={videoData.url}
                config={{
                  file: {
                    tracks: [
                      {
                        label: 'subtitles',
                        kind: 'subtitles',
                        src: videoData.subtitle,
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

                onProgress={playerOnProgress}
                onEnded={playerEnded}
                onError={playerOnError}
                onDuration={playerOnDuration}
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
                {videoData?.statusCode === -1 && (
                  <Paper elevation={2} sx={{ p: 2, m: 1, minWidth: 400, maxWidth: 500 }}>
                    <Typography variant="h4" component="h4" color="error">
                      There was an error...
                    </Typography>
                    <Typography variant="h6" component="h6">
                      {videoData.status}
                    </Typography>
                  </Paper>
                )}
                {videoData?.statusCode === 1 && (
                  <Paper elevation={2} sx={{ p: 2, m: 1, minWidth: 400, maxWidth: 500 }}>
                    <Typography variant="h4" component="h4" mb={2} color="primary">
                      Waiting for a torrent...
                    </Typography>
                    <Typography variant="h6" component="h6" mb={1}>
                      Enter a torrent or magnet link in the room settings to begin downloading...
                    </Typography>
                  </Paper>
                )}
                {videoData?.statusCode === 2 && (
                  <Paper elevation={2} sx={{ p: 2, m: 1, minWidth: 400, maxWidth: 500 }}>
                    <Typography variant="h4" component="h4">
                      Starting download...
                    </Typography>
                  </Paper>
                )}
                {videoData?.statusCode >= 3 && (
                  <Paper elevation={2} sx={{ p: 2, m: 1 }}>
                    <Stack
                      direction="column"
                      alignItems="stretch"
                      justifyContent="center"
                      spacing={2}
                      sx={{
                        minWidth: 400,
                        maxWidth: 500,
                      }}
                    >
                      <Typography variant="h4" component="h4">
                        Preparing room...
                      </Typography>
                      <Typography variant="h6" component="h6" mb={1}>
                        Status: {videoData.status}
                      </Typography>
                      { videoData.percentage !== 0 && ( <LinearProgressWithLabel value={videoData.percentage}  /> ) }
                      {
                        (videoData.percentage !== 0 || videoData.downloadSpeed) && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={2}
                          >
                            { videoData.timeRemaining && (
                              <Typography variant="body2">
                                {moment().to(moment().add(videoData.timeRemaining, 'ms'), true)} remaining
                              </Typography>
                            ) }
                            { videoData.downloadSpeed && (
                              <Typography variant="body2">
                                {videoData.downloadSpeed}
                              </Typography>
                            ) }
                          </Stack>
                        )
                      }
                    </Stack>
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