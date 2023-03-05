import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { CookiesProvider } from 'react-cookie';

import { SocketProvider, useSocket } from 'contexts/socket.context';
import { RoomProvider, useRoom } from 'contexts/room.context';
import { UserProvider, useUser } from 'contexts/user.context';
import { VideoProvider, useVideo } from 'contexts/video.context';

import JoinModal from 'components/JoinModal';
import RoomNavigation from 'components/RoomNavigation';
import Player from 'components/Player';
import TorrentSelect from 'components/TorrentSelect';
import RoomLoadingScreen from 'components/RoomLoadingScreen';

import { Box } from '@mantine/core';

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
  const { room, status, setStatus, closingRoom, setRoom, setEventLog } = useRoom();
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

    const roomUpdateStatus = (data: any) => setStatus(data);

    const videoUpdateData = (data: any) => setVideo(data);

    const videoUpdateState = (data: any) => {
      if (data.roomId !== room.id) return;
      setVideoState({
        ...data.newState,
        updated: Date.now(),
      });
    };

    const updateEvents = (events) => {
      setEventLog(events);
    };

    const onUpdateRoom = (data: any) => {
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
      // window.location.href = '/?connectionLost=1';
    };

    socket.on('roomUpdateStatus', roomUpdateStatus);

    socket.on('videoUpdateData', videoUpdateData);
    socket.on('videoUpdateState', videoUpdateState);
    socket.on('updateEvents', updateEvents);
    socket.on('updateRoom', onUpdateRoom);
    socket.on('roomClosed', onRoomClosed);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('roomUpdateStatus', roomUpdateStatus);

      socket.off('videoUpdateData', videoUpdateData);
      socket.off('videoUpdateState', videoUpdateState);
      socket.off('updateEvents', updateEvents);
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

  const onTorrentStart = (torrentData: any) => {
    if (!socket) return;
    if (!room) return;
    if (!torrentData) return;
    if (!torrentData.url) return;
    socket.emit('roomStartTorrent', {
      id: room.id,
      url: torrentData.url,
      file: torrentData.file,
    }, (res) => {
      if (res.error) alert(res.error);
    });
  };

  if (status?.type == 'playing' && video?.url) {
    return (
      <React.Fragment>
        <Head>
          <title>kelp - { room?.name || 'room' }</title>
        </Head>
        <Player
          videoState={videoState}
          setVideoState={setVideoState}
        />
      </React.Fragment>
    );
  }

  const roomMenuToRender: any = () => {
    if (!status) return;
    // Torrent Select (waiting)
    if (status.type == 'waiting') {
      return (
        <TorrentSelect
          search={search}
          searchDispatch={searchDispatch}
          loadingTitles={loadingTitles}
          setLoadingTitles={setLoadingTitles}
          onTorrentStart={onTorrentStart}
          selectedTitle={selectedTitle}
          setSelectedTitle={setSelectedTitle}
        />
      );
    } else {
      return (
        <RoomLoadingScreen
          roomId={room.id}
          status={status}
        />
      );
    }
  };
  
  return (
    <React.Fragment>
      <Head>
        <title>kelp - { room?.name || 'room' }</title>
      </Head>
      <JoinModal />
      { room ?(
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
            { roomMenuToRender() }
          </Box>
        </Box>
      ) : null}
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