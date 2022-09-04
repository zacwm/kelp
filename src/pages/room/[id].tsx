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

import { Box, Text, Paper, Stack, Group, Progress, Center, ActionIcon } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

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

  const [selectedTitle, setSelectedTitle] = React.useState<any>(null);

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
                    socket={socket}
                    loadingTitles={loadingTitles}
                    setLoadingTitles={setLoadingTitles}
                    titleCategory={titleCategory}
                    searchKeywords={searchKeywords}
                    selectGenre={selectGenre}
                    setSelectGenre={setSelectGenre}
                    selectSort={selectSort}
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
                                          {moment().to(moment().add(video.timeRemaining, 'ms'), true)} remaining
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
                                          {video.downloadSpeed}
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