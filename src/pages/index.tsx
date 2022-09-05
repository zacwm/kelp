import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import { Image, Center } from '@mantine/core';

import ActiveRooms from '../components/ActiveRoomsList/ActiveRooms';
import CreateRooms from '../components/CreateRoom';
import HomeFooter from '../components/HomeFooter';

const Home: NextPage = () => {
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
          top: '18vh',
          left: 0,
          right: 0,
          textAlign: 'center',
          transition: 'top 0.3s ease',
        }}
      />
      <Center sx={{
        height: '100vh',
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <CreateRooms />
          <ActiveRooms />  
        </Box>
      </Center>
      <HomeFooter />
    </Container>
  );
};

export default Home;
