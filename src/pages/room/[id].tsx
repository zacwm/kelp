import * as React from 'react';
import type { NextPage } from 'next';
import io from 'socket.io-client';
import { CookiesProvider } from 'react-cookie';
import moment from 'moment';

import { RoomProvider, useRoom } from '../../contexts/room.context';
import { VideoProvider, useVideo } from '../../contexts/video.context';

import JoinModal from '../../components/JoinModal';
import Player from '../../components/Player';

import TorrentSelect from '../../components/TorrentSelect';

import { Box, Text, Paper, Stack, Group, Progress } from '@mantine/core';

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

  const [socket, setSocket] = React.useState(null);
  const [userId, setUserId] = React.useState(null);

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
  
  return (
    <React.Fragment>
      <JoinModal
        socket={socket}
        setUserId={(id) => setUserId(id)}
        setMenuVisible={() => setMenuVisible(true)}
      />
      {
        room && (
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
          </Box>
        )
      }
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