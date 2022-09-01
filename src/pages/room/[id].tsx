import * as React from 'react';
import type { NextPage } from 'next';
import io from 'socket.io-client';
import { CookiesProvider } from 'react-cookie';
import moment from 'moment';

import { RoomProvider, useRoom } from '../../contexts/room.context';
import { VideoProvider, useVideo } from '../../contexts/video.context';

import JoinModal from '../../components/JoinModal';
import RoomNavigation from '../../components/RoomNavigation';
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

  // States that are shared between RoomNavigation and TorrentSelect.
  const [titleCategory, setTitleCategory] = React.useState('movies');
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [selectGenre, setSelectGenre] = React.useState<string | null>('');
  const [selectSort, setSelectSort] = React.useState<string | null>('trending');
  // const [openCustomTorrentPrompt, setOpenCustomTorrentPrompt] = React.useState<boolean>(false);
  const [loadingTitles, setLoadingTitles] = React.useState<boolean>(true);

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

  if (video?.statusCode === 0 && video?.url) {
    return (
      <Player
        socket={socket}
        toggleMenu={(value?: boolean) => {
          if (value === undefined) return setMenuVisible(!menuVisible);
          setMenuVisible(value);
        }}
        videoState={videoState}
        setVideoState={setVideoState}
      />
    );
  }
  
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
              padding: '30px',
              boxSizing: 'border-box',
            }}
          >
            <RoomNavigation
              socket={socket}
              loadingTitles={loadingTitles}
              titleCategory={titleCategory}
              setTitleCategory={setTitleCategory}
              setSearchKeywords={setSearchKeywords}
              selectGenre={selectGenre}
              setSelectGenre={setSelectGenre}
              selectSort={selectSort}
              setSelectSort={setSelectSort}
              userId={userId}
            />
            {/* "The screen" parent */}
            <Box sx={{
              marginTop: 30,
              height: '100%',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              {
                // Torrent select screen
                video?.statusCode === 1 ? (
                  <TorrentSelect
                    socket={socket}
                    loadingTitles={loadingTitles}
                    setLoadingTitles={setLoadingTitles}
                    titleCategory={titleCategory}
                    searchKeywords={searchKeywords}
                    selectGenre={selectGenre}
                    selectSort={selectSort}
                  />
                )
                  // Starting download screen
                  : video?.statusCode === 2 ? (
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
                  )
                  // Downloading screen
                    : video?.statusCode >= 3 ? (
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
                    )
                    // Error screen
                      : video?.statusCode === -1 ? (
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