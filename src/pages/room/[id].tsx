import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { CookiesProvider } from 'react-cookie';
import moment from 'moment';

import { RoomProvider, useRoom } from '../../contexts/room.context';
import { VideoProvider, useVideo } from '../../contexts/video.context';

import PasswordRequestWindow from '../../components/PasswordRequestWindow';
import Player from '../../components/Player';
import SideMenu from '../../components/SideMenu';
import TorrentSelect from '../../components/TorrentSelect';

import { Grid } from '@mui/material';

import { Box, Button, Text, Paper, Stack, Group, Progress } from '@mantine/core';

function LinearProgressWithLabel(props: any & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Progress {...props} max={100} sx={{ width: '100%' }} />
      </Box>
      <Box sx={{ marginLeft: '10px' }}>
        <Text>{`${Math.round(props.value)}%`}</Text>
      </Box>
    </Box>
  );
}

const Room: React.FC = () => {
  const { room, closingRoom, setRoom } = useRoom();
  const { video, setVideo } = useVideo();

  const router = useRouter();
  const { id, password } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [loadingRoomData, setLoadingRoomData] = React.useState(true);
  const [userId, setUserId] = React.useState(null);
  const [roomNotFound, setRoomNotFound] = React.useState(false);
  const [openPRW, setOpenPRW] = React.useState(false);

  const [videoState, setVideoState] = React.useState(null);

  const [menuVisible, setMenuVisible] = React.useState(false);

  React.useEffect((): any => {
    const newSocket = io();
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  React.useEffect(() => {
    if (!room) return;
    setVideo(room.videoData);
    setVideoState({
      ...room.videoState,
      updated: Date.now(),
    });
  }, [room]);

  React.useEffect((): any => {
    if (!socket) return;
    if (!room) return;

    const videoUpdateData = (data: any) => {
      if (data.roomId !== room.id) return;
      setVideo(data.newData);
    };

    const videoUpdateState = (data: any) => {
      if (data.roomId !== room.id) return;
      setVideoState({
        ...data.newState,
        updated: Date.now(),
      });
    };

    const onUpdateRoom = (data: any) => {
      // TODO: WHY DID I DO THIS, WHY DID I NOT USE SOCKET ROOMS?! THIS HURTS.
      if (room.id !== data.id) return;
      setRoom(data);
    };

    const onRoomClosed = (roomId: string) => {
      if (room.id !== roomId) return;
      if (closingRoom) return window.location.href = '/?roomclosed=2';
      window.location.href = '/?roomclosed=1';
    };

    socket.on('videoUpdateData', videoUpdateData);
    socket.on('videoUpdateState', videoUpdateState);
    socket.on('updateRoom', onUpdateRoom);
    socket.on('roomClosed', onRoomClosed);

    return () => {
      socket.off('videoUpdateData', videoUpdateData);
      socket.off('videoUpdateState', videoUpdateState);
      socket.off('updateRoom', onUpdateRoom);
      socket.off('roomClosed', onRoomClosed);
    };
  }, [room, closingRoom, socket]);

  React.useEffect((): any => {
    if (!socket) return;
    if (!id) return;
    if (room) return;
    setLoadingRoomData(true);
    if (password) {
      router.push(`/room/${id}`, undefined, { shallow: true });
    }
    socket.emit('joinRoom', { id, password }, (res) => {
      setLoadingRoomData(false);
      if (res.roomNotFound) return setRoomNotFound(true);
      if (res.passwordRequest) return setOpenPRW(true);
      if (res.error) return;
      setUserId(res.user);
      setRoom(res.room);
      setMenuVisible(true);
    });
  }, [socket, id]);

  const passwordSubmit = (password: string, callback: any): void => {
    if (!socket) return;
    if (!id) return;
    setLoadingRoomData(true);
    socket.emit('joinRoom', { id, password }, (res) => {
      setLoadingRoomData(false);
      if (res.roomNotFound) return setRoomNotFound(true);
      if (res.error) return callback(res);
      setOpenPRW(false);
      setUserId(res.user);
      setRoom(res.room);
      setMenuVisible(true);
    });
  };
  
  return (
    <React.Fragment>
      <Head>
        <title>kelp - room</title>
      </Head>
      {roomNotFound && (
        <Box
          sx={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            height: '100vh',
            width: '100vw',
            boxSizing: 'border-box',
          }}
        >
          <Stack align="center" sx={{ height: '100vh' }}>
            <Paper p="md">
              <Stack align="center">
                <Text size={30}>Room not found</Text>
                <Button variant="filled" onClick={() => {
                  router.push('/');
                }}>
                  Go back to menu
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      )}
      <PasswordRequestWindow
        open={openPRW}
        isLoading={loadingRoomData}
        passwordSubmit={passwordSubmit}
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          sx={{
            height: '100%',
          }}
        >
          <Grid item xs={menuVisible ? 9.5 : 12}>
            <Box>
              <Box sx={{
                background: 'black',
                position: 'relative',
              }}>
                <Stack
                  sx={{
                    height: '100vh',
                  }}
                >
                  { video?.statusCode === 0 && video?.url ? (
                    <Player
                      socket={socket}
                      menuVisible={menuVisible}
                      toggleMenu={(value?: boolean) => {
                        if (value === undefined) return setMenuVisible(!menuVisible);
                        setMenuVisible(value);
                      }}
                      videoState={videoState}
                      setVideoState={setVideoState}
                    />
                  ) : (
                    <Box
                      sx={{
                        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),url(/novideo.gif)',
                        backgroundSize: 'cover',
                        height: '100vh',
                        width: '100%',
                      }}
                    >
                      <Stack
                        align="center"
                        justify="center"
                        sx={{
                          height: '100vh',
                        }}
                        spacing={0}
                      >
                        {video?.statusCode === -1 && (
                          <Paper
                            shadow="md"
                            radius="sm"
                            p="md"
                            sx={{
                              minWidth: '400px',
                              maxWidth: '600px',
                            }}
                          >
                            <Text>
                              There was an error...
                            </Text>
                            <Text>
                              {video.status}
                            </Text>
                          </Paper>
                        )}
                        {video?.statusCode === 1 && (
                          <TorrentSelect socket={socket} />
                        )}
                        {video?.statusCode === 2 && (
                          <Paper
                            shadow="md"
                            radius="sm"
                            p="md"
                            sx={{
                              minWidth: '400px',
                              maxWidth: '600px',
                            }}
                          >
                            <Text>
                              Starting download...
                            </Text>
                          </Paper>
                        )}
                        {video?.statusCode >= 3 && (
                          <Paper
                            shadow="md"
                            radius="sm"
                            p="md"
                            sx={{
                              minWidth: '400px',
                              maxWidth: '600px',
                            }}
                          >
                            <Stack
                              sx={{
                                minWidth: 400,
                                maxWidth: 500,
                              }}
                            >
                              <Text size={30}>{ video.status }</Text>
                              { video.percentage !== 0 && ( <LinearProgressWithLabel value={video.percentage}  /> ) }
                              {
                                (video.percentage !== 0 || video.downloadSpeed) && (
                                  <Group position="center" grow>
                                    { video.timeRemaining && (
                                      <Text sx={{ textAlign: 'center' }}>
                                        {moment().to(moment().add(video.timeRemaining, 'ms'), true)} remaining
                                      </Text>
                                    ) }
                                    { video.downloadSpeed && (
                                      <Text sx={{ textAlign: 'center' }}>
                                        {video.downloadSpeed}
                                      </Text>
                                    ) }
                                  </Group>
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
          </Grid>
          <Grid 
            item 
            xs={2.5} 
            sx={{
              height: '100%',
            }}
          >
            <SideMenu
              socket={socket}
              userId={userId}
              videoState={videoState}
            />
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

const RoomRoot: NextPage = () => {
  return (
    <CookiesProvider>
      <RoomProvider>
        <VideoProvider>
          <Room />
        </VideoProvider>
      </RoomProvider>
    </CookiesProvider>
  );
};

export default RoomRoot;