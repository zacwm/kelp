import * as React from 'react';

import { useSocket } from '../contexts/socket.context';
import { useRoom } from '../contexts/room.context';
import { useVideo } from '../contexts/video.context';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FileSelectList: React.FC = () => {
  const { socket } = useSocket();
  const { room } = useRoom();
  const { video } = useVideo();

  const onFileSelect = (videoFileId: string) => {
    if (!videoFileId) return;
    if (!socket) return;
    if (!room) return;

    socket.emit('videoSelectFile', {
      roomId: room.id,
      fileId: videoFileId,
    });
  };

  return (
    <Stack
      direction="column"
      alignItems="stretch"
      justifyContent="flex-start"
      spacing={1}
    >
      {
        (video?.files || []).map((videoFile, index) => (
          <Paper key={index} elevation={5} sx={{ p: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <VideoFileIcon />
              <Typography sx={{
                flex: 1,
                textOverflow: 'ellipsis',
                wordWrap: 'none',
                maxWidth: '200px',
              }}>{ videoFile.name }</Typography>
              <ArrowForwardIcon
                onClick={() => { onFileSelect(videoFile.id); }}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
          </Paper>
        ))
      }
    </Stack>
  );
};

export default FileSelectList;