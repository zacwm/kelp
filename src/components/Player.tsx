import * as React from 'react';
import io from 'socket.io-client';

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
  roomData: any;
  menuVisible: boolean;
  toggleMenu: () => void;
}

const Player: React.FC<Props> = ({ roomData, menuVisible, toggleMenu }) => {
  const [videoData, setVideoData] = React.useState(null);
  const [videoState, setVideoState] = React.useState({
    playing: true,
  });

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
    if (roomData) {
      setVideoData({
        src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        title: 'Sintel',
      });
    }
  }, [roomData]);

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

  // Volume control
  React.useEffect(() => {
    if (!videoData) return;
    if (!videoElemRef) return;
    if (!videoElemRef.current) return;
    videoElemRef.current.volume = inputVolumeSlider / 100;
  }, [videoData, inputVolumeSlider]);

  const volumeSliderChange = (event: Event, newValue: number | number[]) => {
    if (!videoData) return;
    setInputVolumeSlider(newValue as number);
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
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
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
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
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
                        {'Hello'}
                      </Typography>
                      <Stack spacing={2} direction="row" sx={{ mb: 1, minWidth: 150 }} alignItems="center">
                        <VolumeDown />
                        <Slider aria-label="Volume" value={inputVolumeSlider} onChange={volumeSliderChange} />
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