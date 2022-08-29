import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import { Image } from '@mantine/core';
import ActiveRooms from '../components/ActiveRoomsList/ActiveRooms';
import CreateRooms from '../components/CreateRoom';
import HomeFooter from '../components/HomeFooter';

const Home: NextPage = () => {
  const [socket, setSocket] = React.useState(null);

  React.useEffect((): any => {
    const newSocket = io();
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <Container maxWidth="lg">
      <Head>
        <title>kelp - menu</title>
      </Head>
      <Image 
        src='/kelp-gradient-text.svg'
        height={70}
        fit='contain'
        sx={{
          position: 'absolute',
          top: '18%',
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100vh',
        }}
      >
        <CreateRooms socket={socket}/>
        <ActiveRooms socket={socket}/>  
      </Box>
      <HomeFooter />
    </Container>
  );
};

export default Home;
