import * as React from 'react';
import type { Socket } from 'socket.io-client';

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
  const [videoData, setVideoData] = React.useState(null);
  const [videoState, setVideoState] = React.useState(null);

  const [videoTimePosition, setVideoTimePosition] = React.useState(0);

  const [mouseOverVideo, setMouseOverVideo] = React.useState(false);
  const [mouseRecentMove, setMouseRecentMove] = React.useState(false);
  const [mouseOverControls, setMouseOverControls] = React.useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = React.useState(false);

  const [inputVolumeSlider, setInputVolumeSlider] = React.useState<number>(50);

  const videoElemRef = React.useRef<HTMLVideoElement>(null);

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
    setVideoData({
      src: 'http://localhost:3000/test.mp4',
      title: 'Dog of Wisdom',
    });
    setVideoState(roomData.videoState);
  }, [roomData]);

  // Socket events
  React.useEffect(() => {
    if (!socket) return;

    const videoUpdateState = (data: any) => {
      if (data.roomId !== roomData.id) return;
      setVideoState(data.newState);
    };

    socket.on('videoUpdateState', videoUpdateState);

    return () => {
      socket.off('videoUpdateState', videoUpdateState);
    };
  }, [roomData, socket]);

  // Video state management
  React.useEffect(() => {
    if (!videoData) return;
    if (!videoState) return;
    if (!videoElemRef) return;

    // Check if the video is playing
    if (videoState.playing) {
      videoElemRef.current.play();
    } else {
      videoElemRef.current.pause();
    }
  }, [videoData, videoState]);

  React.useEffect(() => {
    if (!videoData) return;
    if (!videoState) return;
    if (!videoElemRef) return;
    
    console.dir(videoState);
  }, [videoState]);

  // Video time position montioring
  React.useEffect(() => {
    if (!videoData) return;
    if (!videoState) return;
    if (!videoElemRef) return;

    videoElemRef.current.ontimeupdate = () => {
      // If video is over 2 seconds behind or ahead, set it to the correct position
      if (videoElemRef.current.currentTime > videoState.timePosition + 2) {
        videoElemRef.current.currentTime = videoState.timePosition;
      } else if (videoElemRef.current.currentTime < videoState.timePosition - 2) {
        videoElemRef.current.currentTime = videoState.timePosition;
      }
    };

    videoElemRef.current.onended = () => {
      console.info('Video ended');
      socket.emit('videoEndedEvent', {
        id: roomData.id,
      });
    };
  }, [roomData, videoData, videoState]);

  // User Events
  // - Volume control
  React.useEffect(() => {
    if (!videoData) return;
    if (!videoElemRef) return;
    if (!videoElemRef.current) return;
    videoElemRef.current.volume = inputVolumeSlider / 100;
  }, [inputVolumeSlider]);

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
          {videoData?.src ? (
            <Box
              onMouseOver={() => setMouseOverVideo(true) }
              onMouseOut={() => setMouseOverVideo(false) }
              sx={{
                height: '100%',
                width: '100%',
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
                      <Stack spacing={2} direction="row" sx={{ mb: 1, minWidth: 150 }} alignItems="center">
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
              <video
                width="100%"
                height="100%"
                ref={videoElemRef}
              >
                <source src={videoData.src} type="video/mp4" />
                Your browser does not support HTML video.
              </video>
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
                      Status: {videoData.preparing.stage}
                    </Typography>
                    { videoData.preparing.progress && ( <LinearProgressWithLabel value={videoData.preparing.progress} /> ) }
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

export default Player;