import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { CookiesProvider } from 'react-cookie';
import moment from 'moment';

import { SocketProvider, useSocket } from 'contexts/socket.context';
import { RoomProvider, useRoom } from 'contexts/room.context';
import { UserProvider, useUser } from 'contexts/user.context';
import { VideoProvider, useVideo } from 'contexts/video.context';

import JoinModal from 'components/JoinModal';
import RoomNavigation from 'components/RoomNavigation';
import Player from 'components/Player';
import TorrentSelect from 'components/TorrentSelect';

import { Box, Text, Paper, Stack, Group, Progress, Center, ActionIcon } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

// Reducer for search
const initialSearchState = {
  category: 'movies',
  genre: '',
  sort: 'trending',
  keywords: '',
};

const searchReducer = (state, action) => {
  if (action.type === 'reset') {
    return initialSearchState;
  }

  const newState = { ...state };
  newState[action.type] = action.value;
  return newState;
};

const Room: React.FC = () => {
  const { socket } = useSocket();
  const { room, closingRoom, setRoom } = useRoom();
  const { video, setVideo } = useVideo();
  const { user, setUser } = useUser();

  const [videoState, setVideoState] = React.useState(null);

  // States that are shared between RoomNavigation and TorrentSelect.
  const [search, searchDispatch] = React.useReducer(searchReducer, initialSearchState);
  const [loadingTitles, setLoadingTitles] = React.useState<boolean>(true);

  const [selectedTitle, setSelectedTitle] = React.useState<any>(null);

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

      // Find self based on user id and update user context
      const self = data.users.find((u) => u.id === user.id);
      if (self) {
        setUser(self);
      }
    };

    const onRoomClosed = (roomId: string) => {
      if (room.id !== roomId) return;
      if (closingRoom) return window.location.href = '/?roomclosed=2';
      window.location.href = '/?roomclosed=1';
    };

    const onDisconnect = () => {
      window.location.href = '/?connectionLost=1';
    };

    socket.on('videoUpdateData', videoUpdateData);
    socket.on('videoUpdateState', videoUpdateState);
    socket.on('updateRoom', onUpdateRoom);
    socket.on('roomClosed', onRoomClosed);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('videoUpdateData', videoUpdateData);
      socket.off('videoUpdateState', videoUpdateState);
      socket.off('updateRoom', onUpdateRoom);
      socket.off('roomClosed', onRoomClosed);
      socket.off('disconnect', onDisconnect);
    };
  }, [
    room,
    user,
    closingRoom,
    socket,
  ]);

  const onTorrentStart = (torrentURL: string) => {
    if (!socket) return;
    if (!room) return;
    if (!torrentURL) return;
    socket.emit('roomStartTorrent', {
      id: room.id,
      url: torrentURL,
    }, (res) => {
      if (res.error) alert(res.error);
    });
  };

  if (video?.statusCode === 0 && video?.url) {
    return (
      <Player
        videoState={videoState}
        setVideoState={setVideoState}
      />
    );
  }
  
  return (
    <React.Fragment>
      <Head>
        <title>kelp - { room?.name || 'room' }</title>
      </Head>
      <JoinModal />
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
              padding: '30px',
              boxSizing: 'border-box',
            }}
          >
            <RoomNavigation
              search={search}
              searchDispatch={searchDispatch}
              loadingTitles={loadingTitles}
              onTorrentStart={onTorrentStart}
              setSelectedTitle={setSelectedTitle}
            />
            {/* "The screen" parent */}
            <Box sx={{
              position: 'relative',
              marginTop: 30,
              height: '100%',
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              {
                // Torrent select screen
                video?.statusCode === 1 ? (
                  <TorrentSelect
                    search={search}
                    searchDispatch={searchDispatch}
                    loadingTitles={loadingTitles}
                    setLoadingTitles={setLoadingTitles}
                    onTorrentStart={onTorrentStart}
                    selectedTitle={selectedTitle}
                    setSelectedTitle={setSelectedTitle}
                  />
                )
                  // Starting download screen
                  : video?.statusCode === 2 ? (
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#000',
                      }}
                    >
                      <ActionIcon
                        sx={{
                          position: 'absolute',
                          top: 30,
                          left: 30,
                        }}
                        onClick={() => {
                          socket.emit('resetRoom', room.id);
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={faArrowLeft} 
                          style={{ 
                            color: '#fff',
                            fontSize: 20,
                          }} 
                        />
                      </ActionIcon>
                      <Center sx={{ height: '100%' }}>
                        <Paper
                          style={{
                            position: 'relative',
                            boxSizing: 'border-box',
                            padding: 30,
                            width: 465,
                            borderRadius: 12,
                            backgroundColor: '#191921',
                          }}
                        >
                          <Stack
                            sx={{
                              minWidth: 400,
                              maxWidth: 500,
                            }}
                            spacing={30}
                          >
                            <Text sx={{ fontSize: 18, color: '#98989a' }}>
                              Starting download...
                            </Text>
                          </Stack>
                        </Paper>
                      </Center>
                    </Box>
                  )
                  // Downloading screen
                    : video?.statusCode >= 3 ? (
                      <Box
                        sx={{
                          height: '100%',
                          width: '100%',
                          backgroundColor: '#000',
                        }}
                      >
                        <ActionIcon
                          sx={{
                            position: 'absolute',
                            top: 30,
                            left: 30,
                          }}
                          onClick={() => {
                            socket.emit('resetRoom', room.id);
                          }}
                        >
                          <FontAwesomeIcon 
                            icon={faArrowLeft} 
                            style={{ 
                              color: '#fff',
                              fontSize: 20,
                            }} 
                          />
                        </ActionIcon>
                        <Center sx={{ height: '100%' }}>
                          <Paper
                            style={{
                              position: 'relative',
                              boxSizing: 'border-box',
                              padding: 30,
                              width: 465,
                              borderRadius: 12,
                              backgroundColor: '#191921',
                            }}
                          >
                            <Stack
                              sx={{
                                minWidth: 400,
                                maxWidth: 500,
                              }}
                              spacing={30}
                            >
                              <Text sx={{ fontSize: 18, color: '#98989a' }}>
                                { video.status }
                              </Text>
                              { video.percentage !== 0 && (
                                <Progress
                                  value={video.percentage}
                                  sx={{ width: '100%' }}
                                  size={5}
                                />
                              )}
                              {
                                (video.percentage !== 0 || video.downloadSpeed) && (
                                  <Group spacing={20}>
                                    { video.timeRemaining && (
                                      <Group spacing={10}>
                                        <FontAwesomeIcon 
                                          icon={faDownload} 
                                          style={{ 
                                            color: '#98989a',
                                            fontSize: 18,
                                          }} 
                                        />
                                        <Text sx={{ fontSize: 14, color: '#98989a' }}>
                                          {video.downloadSpeed}
                                        </Text>
                                      </Group>
                                    ) }
                                    { video.downloadSpeed && (
                                      <Group spacing={10}>
                                        <FontAwesomeIcon 
                                          icon={faClock} 
                                          style={{ 
                                            color: '#98989a',
                                            fontSize: 18,
                                          }} 
                                        />
                                        <Text sx={{ fontSize: 14, color: '#98989a' }}>
                                          {moment().to(moment().add(video.timeRemaining, 'ms'), true)} remaining
                                        </Text>
                                      </Group>
                                    ) }
                                  </Group>
                                )
                              }
                            </Stack>
                          </Paper>
                        </Center>
                      </Box>
                    )
                    // Error screen
                      : video?.statusCode === -1 ? (
                        <Box
                          sx={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: '#000',
                          }}
                        >
                          <ActionIcon
                            sx={{
                              position: 'absolute',
                              top: 30,
                              left: 30,
                            }}
                            onClick={() => {
                              socket.emit('resetRoom', room.id);
                            }}
                          >
                            <FontAwesomeIcon 
                              icon={faArrowLeft} 
                              style={{ 
                                color: '#fff',
                                fontSize: 20,
                              }} 
                            />
                          </ActionIcon>
                          <Center sx={{ height: '100%' }}>
                            <Paper
                              style={{
                                position: 'relative',
                                boxSizing: 'border-box',
                                padding: 30,
                                width: 465,
                                borderRadius: 12,
                                backgroundColor: '#191921',
                              }}
                            >
                              <Stack
                                sx={{
                                  minWidth: 400,
                                  maxWidth: 500,
                                }}
                                spacing={30}
                              >
                                <Text sx={{ fontSize: 18, color: '#98989a' }}>
                                  There was an error...
                                </Text>
                                <Text sx={{ fontSize: 14, color: '#98989a' }}>
                                  {video.status}
                                </Text>
                              </Stack>
                            </Paper>
                          </Center>
                        </Box>
                      ) : null
              }
            </Box>
          </Box>
        )
      }
    </React.Fragment>
  );
};

const RoomRoot: NextPage = () => {
  return (
    <SocketProvider>
      <CookiesProvider>
        <RoomProvider>
          <UserProvider>
            <VideoProvider>
              <Room />
            </VideoProvider>
          </UserProvider>
        </RoomProvider>
      </CookiesProvider>
    </SocketProvider>
  );
};

export default RoomRoot;