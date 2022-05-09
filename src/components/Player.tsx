import * as React from 'react';

import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

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
}

const Player: React.FC<Props> = ({ roomData }) => {
  const [videoData, setVideoData] = React.useState(null);

  React.useEffect(() => {
    if (roomData) {
      setVideoData({
        src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
      });
    }
  }, [roomData]);
  
  return (
    <React.Fragment>
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
            <React.Fragment>
              <Box sx={{
                position: 'absolute',
                zIndex: 1,
                top: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
                padding: 2,
              }}>
                <Typography>
                  {'Hello'}
                </Typography>
              </Box>
              <video width="100%" height="100%" autoPlay>
                <source src={videoData.src} type="video/mp4" />
                Your browser does not support HTML video.
              </video>
            </React.Fragment>
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
    </React.Fragment>
  );
};

export default Player;