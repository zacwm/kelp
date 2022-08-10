import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import {Text} from '@mantine/core';
import ActiveRooms from '../components/ActiveRooms';
import CreateRooms from '../components/CreateRoom';

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
        <CreateRooms socket={socket}/>
        <ActiveRooms socket={socket}/>
      </Box>
    </Container>
  );
};

export default Home;
