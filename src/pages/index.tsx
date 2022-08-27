import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import {Image, Paper} from '@mantine/core';
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
        }} />
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
        <Grid item xs={12}>
          <Paper  p="md" 
            sx={{
              position: 'absolute',
              bottom: '0px',
              left: 0,
              right: 0,
              textAlign: 'center',
              backgroundColor: '#08080f' }}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="caption" component="span">
                Version: 1.1.2
              </Typography>
              <Link
                component="a"
                target="_blank"
                href="https://github.com/zacimac/kelp"
                rel="noopener"
                variant="caption"
              >
                GitHub
              </Link>
            </Stack>
          </Paper>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
