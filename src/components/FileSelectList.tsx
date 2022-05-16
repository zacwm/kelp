import * as React from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

type Props = {
  socket: any;
  roomData: any;
  videoData: any;
}

const FileSelectList: React.FC<Props> = ({ socket, roomData, videoData }) => {

  const onFileSelect = (videoFileId: string) => {
    if (!videoFileId) return;
    if (!socket) return;
    if (!roomData) return;

    socket.emit('videoSelectFile', {
      roomId: roomData.id,
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
        (videoData?.files || []).map((videoFile, index) => (
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