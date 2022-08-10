import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';

import { Alert, Button, Divider, Text, TextInput, PasswordInput, Paper } from '@mantine/core';
import { IconLockOpen, IconLock, IconAlertCircle  } from '@tabler/icons';


const Home: NextPage = () => {
  const router = useRouter();
  const { roomclosed } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [activeRooms, setActiveRooms] = React.useState([]);
  const [createRoomPending, setCreateRoomPending] = React.useState(false);
  const [createRoomErrorMessage, setCreateRoomErrorMessage] = React.useState(null);
  const [roomClosedMessage, setRoomClosedMessage] = React.useState(false);

  const refInputRoomName = React.useRef<HTMLInputElement>(null);
  const refInputRoomPassword = React.useRef<HTMLInputElement>(null);

  React.useEffect((): any => {
    const newSocket = io();
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  React.useEffect((): void => {
    if (roomclosed) {
      router.push('/', undefined, { shallow: true });
      setRoomClosedMessage(true);
    }
  }, [roomclosed]);

  React.useEffect((): any => {
    if (!socket) return;
    
    const Event_allRooms = (rooms) => {
      setActiveRooms(rooms);
    };

    socket.on('getRoomsList', Event_allRooms);

    return () => {
      socket.off('getRoomsList', Event_allRooms);
    };
  }, [socket]);

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

  return (
    <Container maxWidth="lg">
      <Head>
        <title>kelp - menu</title>
      </Head>
      <Text size={60} sx={(theme) => ({
        position: 'absolute',
        top: '8%',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: theme.colors.brand[7],
      })}>
        kelp
      </Text>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
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
              {roomClosedMessage && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="So about the room you were in..."
                  withCloseButton
                  variant="outline"
                  onClose={() => setRoomClosedMessage(false)}
                  sx={{ marginBottom: 15 }}
                >
                  It was closed by the host. Maybe it&apos;s time to create your own!
                </Alert>
              )}
              <Paper shadow="xs" p="md" withBorder sx={{
                padding: 2,
              }}>
                <Text size={25} mb={4} align="center">
                  Active rooms
                </Text>
                <Stack alignItems="stretch" spacing={2}>
                  {activeRooms.length === 0 && <Text>No rooms found...</Text>}
                  {
                    activeRooms.map(room => (
                      <React.Fragment key={room.id}>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center" 
                          spacing={2}
                        >
                          {room.hasPassword ? (
                            <IconLock size={40} />
                          ) : (
                            <IconLockOpen size={40} />
                          )}
                          <Stack
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start" 
                            spacing={0}
                            sx={{ flex: 1 }}
                          >
                            <Text size="xl" weight={700}>
                              {room.name}
                            </Text>
                            <Text size="sm" italic>
                              {room.status}
                            </Text>
                          </Stack>
                          <Button onClick={() => router.push(`/room/${room.id}`)}>Join Room</Button>
                        </Stack>
                        {activeRooms.length - 1 !== activeRooms.indexOf(room) && <Divider />}
                      </React.Fragment>
                    ))
                  }
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;