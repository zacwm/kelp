import * as React from 'react';

import { useSocket } from '../contexts/socket.context';
import { useRoom } from '../contexts/room.context';
import { useVideo } from '../contexts/video.context';

import FileSelectList from './FileSelectList';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { Accordion, Button, Paper, Select, NumberInput } from '@mantine/core';

type Props = {
  userId: string;
  videoState: any;
}

const SideMenu: React.FC<Props> = ({ videoState }) => {
  const { socket } = useSocket();
  const { room, setClosingRoom } = useRoom();
  const { video } = useVideo();

  const isDev = process.env.NODE_ENV === 'development';

  const selectActionTypeOptions = [
    { value: '1', label: '[1] Reset room' },
    { value: '2', label: '[2] Convert test mkv' },
    { value: '3', label: '[3] Convert test mp4' },
    { value: '4', label: '[4] Convert test avi' },
    { value: '5', label: '[5] Convert test mov' },
  ];

  const refTestingSeconds = React.useRef<HTMLInputElement>(null);

  // TODO: Testing stuff below
  const [inputTimePosition, setInputTimePosition] = React.useState<number | undefined>(undefined);
  const [inputSelect, setInputSelect] = React.useState<number>(0);

  const buttonSubmitTimeChange = () => {
    socket.emit('videoChangePlaybackTime', {
      id: room.id,
    }, inputTimePosition);
  };

  const handleChange = (value: string) => {
    setInputSelect(parseInt(value));
  };

  React.useEffect(() => {
    if (!videoState?.timePosition) return;
    setInputTimePosition(Math.floor(videoState.timePosition || 0));
  }, [videoState]);
  
  return (
    <React.Fragment>
      <Paper shadow="md" radius="md">
        <Stack
          direction="column"
          alignItems="stretch"
          justifyContent="space-between"
          sx={() => ({
            height: '100vh',
            width: '100%',
            maxHeight: '100vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
          })}
        >
          <Box>
            <Accordion variant="filled" radius="xs">
              <Accordion.Item value="room">
                <Accordion.Control>Room</Accordion.Control>
                <Accordion.Panel>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                  >
                    { video?.statusCode === 0 && (
                      <Button
                        onClick={() => {
                          socket.emit('resetRoom', room.id);
                        }}
                      >
                        Select Torrent
                      </Button>
                    ) }
                    { ![0, 1].includes(video?.statusCode) && (
                      <Button
                        color="red"
                        onClick={() => {
                          socket.emit('resetRoom', room.id);
                        }}
                      >
                        Stop Download
                      </Button>
                    ) }
                    <Button
                      color="gray"
                      onClick={() => {
                        setClosingRoom();
                        socket.emit('closeRoom', room.id);
                      }}
                    >
                      Close room
                    </Button>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="users">
                <Accordion.Control>Users</Accordion.Control>
                <Accordion.Panel>
                  
                </Accordion.Panel>
              </Accordion.Item>
              { (video?.files || []).length > 1 && (
                <Accordion.Item value="files">
                  <Accordion.Control>Files</Accordion.Control>
                  <Accordion.Panel>
                    <FileSelectList />
                  </Accordion.Panel>
                </Accordion.Item>
              ) }
            </Accordion>
          </Box>
          <Stack
            direction="column"
            alignItems="stretch"
            justifyContent="center"
          >
            {isDev && (
              <Accordion variant="filled" radius="xs">
                <Accordion.Item value="testingbuttons">
                  <Accordion.Control>Testing Buttons</Accordion.Control>
                  <Accordion.Panel>
                    <Stack
                      direction="column"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <NumberInput
                        value={inputTimePosition}
                        onChange={(val) => setInputTimePosition(val)}
                        ref={refTestingSeconds}
                        disabled={videoState?.playing}
                      />
                      <Button onClick={buttonSubmitTimeChange} disabled={videoState?.playing}>
                        Set seconds
                      </Button>
                      <Select
                        value={inputSelect.toString()}
                        onChange={handleChange}
                        data={selectActionTypeOptions}
                      />
                      <Button onClick={() => socket.emit('playerTest', room.id, inputSelect) }>
                        Run action
                      </Button>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="debuginfo">
                  <Accordion.Control>Debug Info</Accordion.Control>
                  <Accordion.Panel>
                    <Stack
                      direction="column"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      {
                        video?.extra ? Object.keys(video?.extra || {}).map((key) => (
                          <Typography variant="body2" component="span" key={`extra_${key}`}>
                            {key}: {video?.extra[key]}
                          </Typography>
                        )) : (
                          <Typography variant="body1" component="span" color="primary">
                            No information available
                          </Typography>
                        )
                      }
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            )}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{
                p: 1,
                borderTop: '1px solid #555',
              }}
            >
              <Typography variant="caption" component="span">
                Version 2.0.0
              </Typography>
              <Link
                component="a"
                target="_blank"
                href="https://github.com/zacimac/kelp"
                rel="noopener"
                variant="caption"
              >
                GitHub
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </React.Fragment>
  );
};

export default SideMenu;