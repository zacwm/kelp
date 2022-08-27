import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { Image, Paper, Group, Text } from '@mantine/core';
import ActiveRooms from '../components/ActiveRoomsList/ActiveRooms';
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
      <Paper
        p="md" 
        sx={{
          position: 'absolute',
          bottom: '0px',
          left: 0,
          right: 0,
          textAlign: 'center',
          backgroundColor: '#08080f'
        }}
      >
        <Group
          position="center"
        >
          <Text
            size="sm"
          >
            Version: 2.0.0
          </Text>
          <Text
            variant="link"
            component="a"
            target="_blank"
            href="https://github.com/zacimac/kelp"
            size="sm"
          >
            GitHub
          </Text>
        </Group>
      </Paper>
    </Container>
  );
};

export default Home;
