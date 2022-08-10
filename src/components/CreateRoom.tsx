import * as React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import {IconAlertCircle } from '@tabler/icons';

import { Button, Paper, Alert, Text, TextInput, PasswordInput, Collapse} from '@mantine/core';

type Props = {
  socket: any;
}

const CreateRooms: React.FC<Props> = ({ socket }) => {
  const [createRoomPending, setCreateRoomPending] = React.useState(false);
  const [createRoomErrorMessage, setCreateRoomErrorMessage] = React.useState(null);
  const refInputRoomName = React.useRef<HTMLInputElement>(null);
  const refInputRoomPassword = React.useRef<HTMLInputElement>(null);

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const buttonCreateRoom = async (): Promise<void> => {
    if (!socket) return;
    if (createRoomPending) return;
    setCreateRoomPending(true);
    if (createRoomErrorMessage) {
      setCreateRoomErrorMessage(null);
      await timeout(300);
    }
    socket.emit('createRoom', {
      name: refInputRoomName.current?.value,
      password: refInputRoomPassword.current?.value,
    }, (res) => {
      setCreateRoomPending(false);
      if (res.error) return setCreateRoomErrorMessage(res.error);
      if (res.roomId) {
        window.location.href = refInputRoomPassword.current?.value ? `/room/${res.roomId}?password=${refInputRoomPassword.current?.value}` : `/room/${res.roomId}`;
      } else {
        setCreateRoomErrorMessage('Unknown error');
      }
    });
  };
  
  return(
    <Box
      sx={{
        mx: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper shadow="xs" p="md" withBorder sx={{
            padding: 2,
          }}>
            <Stack alignItems="center" spacing={2}>
              <Text size={25} mb={4}>
                    Create a room
              </Text>
              <TextInput
                placeholder="Room name"
                size="lg"
                disabled={createRoomPending}
                ref={refInputRoomName}
                sx={{ width: '100%' }}
              />
              <PasswordInput
                placeholder="Room password (optional)"
                size="lg"
                disabled={createRoomPending}
                ref={refInputRoomPassword}
                sx={{ width: '100%', mb: 2 }}
              />
              <Button
                onClick={buttonCreateRoom}
                disabled={createRoomPending}
              >Create Room</Button>
            </Stack>
            <Collapse
              in={createRoomErrorMessage} 
              sx={{
                width: '100%',
              }}
            >
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Oh, uhh..."
                withCloseButton
                variant="outline"
                color="red"
                onClose={() => setCreateRoomErrorMessage(null)}
                sx={{ marginTop: 15 }}
              >
                {createRoomErrorMessage}
              </Alert>
            </Collapse>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper shadow="xs" p="md" withBorder sx={{
            padding: 2,
          }}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="caption" component="span">
                    Version: 1.1.2
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateRooms;