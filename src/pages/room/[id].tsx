import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

import PasswordRequestWindow from '../../components/PasswordRequestWindow';
import Player from '../../components/Player';
import SideMenu from '../../components/SideMenu';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const Room: NextPage = () => {
  const router = useRouter();
  const { id, password } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [loadingRoomData, setLoadingRoomData] = React.useState(true);
  const [userId, setUserId] = React.useState(null);
  const [roomData, setRoomData] = React.useState(null);
  const [roomNotFound, setRoomNotFound] = React.useState(false);
  const [openPRW, setOpenPRW] = React.useState(false);

  const [videoState, setVideoState] = React.useState(null);
  const [videoData, setVideoData] = React.useState(null);

  const [menuVisible, setMenuVisible] = React.useState(false);

  React.useEffect((): any => {
    const newSocket = io(`https://${window.location.hostname}`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  React.useEffect((): any => {
    if (!socket) return;
    if (!roomData) return;

    const onUpdateRoom = (data: any) => {
      if (roomData.id !== data.id) return;
      setRoomData(data);
    };

    socket.on('updateRoom', onUpdateRoom);

    return () => {
      socket.off('updateRoom', onUpdateRoom);
    };
  }, [roomData, socket]);

  React.useEffect((): any => {
    if (!socket) return;
    if (!id) return;
    if (roomData) return;
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
      setRoomData(res.room);
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
      setRoomData(res.room);
      setMenuVisible(true);
    });
  };

  React.useEffect((): any => {
    if (!socket) return;
    /*
    const Event_room = (room) => {
      setRoomData(room);
    };
    socket.on('room', Event_room);
    return () => {
      socket.off('room', Event_room);
    };
    */
  }, [socket]);
  
  return (
    <React.Fragment>
      <Head>
        <title>kelp - room</title>
      </Head>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={roomNotFound}
      >
        <Paper sx={{ px: 4, py: 2 }}>
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <Typography variant="h4" component="h4" mb={1}>
              Room not found
            </Typography>
            <Button variant="contained" onClick={() => {
              router.push('/');
            }}>
              Go to menu
            </Button>
          </Stack>
        </Paper>
      </Backdrop>
      <PasswordRequestWindow
        open={openPRW}
        isLoading={loadingRoomData}
        passwordSubmit={passwordSubmit}
      />
      <Box
        position="fixed"
        top={0}
        height="100vh"
        width="100vw"
        display="flex"
        flexDirection="column"
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
            <Player
              socket={socket}
              roomData={roomData}
              menuVisible={menuVisible}
              toggleMenu={(value?: boolean) => {
                if (value === undefined) return setMenuVisible(!menuVisible);
                setMenuVisible(value);
              }}
              videoState={videoState}
              setVideoState={setVideoState}
              videoData={videoData}
              setVideoData={setVideoData}
            />
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
              roomData={roomData}
              userId={userId}
              videoState={videoState}
              videoData={videoData}
            />
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default Room;