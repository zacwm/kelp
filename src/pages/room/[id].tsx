import * as React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

import PasswordRequestWindow from '../../components/PasswordRequestWindow';

import Backdrop from '@mui/material/Backdrop';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Room: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [roomData, setRoomData] = React.useState(null);
  const [openPRW, setOpenPRW] = React.useState(false);

  React.useEffect((): any => {
    const newSocket = io(`http://${window.location.hostname}:3000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  React.useEffect((): any => {
    if (!socket) return;
    if (!id) return;
    socket.emit('getRoom', { id }, (res) => {
      if (res.passwordRequest) return setOpenPRW(true);
      if (res.error) return;
    });
  }, [socket, id]);

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
      <PasswordRequestWindow open={openPRW} passwordResponse={(password) => { console.dir(password); }} />
      <Box>
        <Typography variant="h2" component="h1" color="primary" mb={2}>
          kelp - {id}
        </Typography>
      </Box>
    </React.Fragment>
  );
};

export default Room;