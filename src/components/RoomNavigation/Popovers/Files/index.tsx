import * as React from 'react';

import { useSocket } from 'contexts/socket.context';
import { useRoom } from 'contexts/room.context';
import { useVideo } from 'contexts/video.context';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import {
  ActionIcon,
  Popover,
  Text,
  Stack,
} from '@mantine/core';
import FileItem from './FileItem';

const FilesPopover: React.FC = () => {
  const { socket } = useSocket();
  const { room } = useRoom();
  const { video } = useVideo();

  return (
    <Popover
      width={500}
      position="bottom"
      shadow="md"
    >
      <Popover.Target>
        <ActionIcon>
          <FontAwesomeIcon 
            icon={faFile}
            style={{
              fontSize:'22px',
            }} 
          />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        sx={{
          borderRadius: 12,
          backgroundColor: '#2f2f3d',
          border: 'none',
        }}
      >
        <Stack spacing={0}>
          <Text
            sx={{
              mb: 6,
              fontSize: 18,
            }}
          >
            Files
          </Text>
          {
            (video?.files || []).map((file, index) => (
              <FileItem
                key={index}
                name={file.name}
                progress={file.downloadProgress}
                ready={file.ready}
                selected={file.selected}
                onSelect={() => {
                  if (!socket) return;
                  socket.emit('videoSelectFile', {
                    roomId: room.id,
                    fileId: file.id,
                  });
                }}
              />
            ))
          }
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default FilesPopover;