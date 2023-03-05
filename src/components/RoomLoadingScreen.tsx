import React from 'react';
import moment from 'moment';

import { useSocket } from 'contexts/socket.context';

import { ActionIcon, Box, Paper, Progress, Group, Text, Stack, Center } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

interface RoomLoadingScreenProps {
  roomId: string;
  status: any;
}

const RoomLoadingScreen: React.FC<RoomLoadingScreenProps> = ({ roomId, status }) => {
  const { socket } = useSocket();

  return (
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
          socket.emit('resetRoom', roomId);
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
              { status.message }
            </Text>
            { status.percentage ? (
              <Progress
                value={status.percentage}
                sx={{ width: '100%' }}
                size={5}
              />
            ) : null }
            { (status.timeRemaining || status.speed) ? (
              <Group spacing={20}>
                { status.speed ? (
                  <Group spacing={10}>
                    <FontAwesomeIcon 
                      icon={faDownload} 
                      style={{ 
                        color: '#98989a',
                        fontSize: 18,
                      }} 
                    />
                    <Text sx={{ fontSize: 14, color: '#98989a' }}>
                      { status.speed }
                    </Text>
                  </Group>
                ) : null }
                { status.timeRemaining ? (
                  <Group spacing={10}>
                    <FontAwesomeIcon 
                      icon={faClock} 
                      style={{ 
                        color: '#98989a',
                        fontSize: 18,
                      }} 
                    />
                    <Text sx={{ fontSize: 14, color: '#98989a' }}>
                      {moment().to(moment().add(status.timeRemaining, 'ms'), true)} remaining
                    </Text>
                  </Group>
                ) : null }
              </Group>
            ) : null }
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
};

export default RoomLoadingScreen;