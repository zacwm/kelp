import * as React from 'react';
import { useRouter } from 'next/router';

import { useSocket } from 'contexts/socket.context';

import RoomItem from './RoomItem';

import { IconAlertCircle } from '@tabler/icons';

import {
  Stack,
  Box,
  Paper,
  Alert,
  Text,
  ScrollArea,
} from '@mantine/core';

const ActiveRooms: React.FC = () => {
  const router = useRouter();
  const { roomclosed } = router.query;

  const { socket } = useSocket();
  
  const [roomClosedMessage, setRoomClosedMessage] = React.useState(undefined);
  const [activeRooms, setActiveRooms] = React.useState([]);

  React.useEffect((): void => {
    if (roomclosed) {
      router.push('/', undefined, { shallow: true });
      setRoomClosedMessage(roomclosed);
    }
  }, [roomclosed]);

  React.useEffect((): any => {
    if (!socket) return;
    
    const Event_allRooms = (rooms) => {
      setActiveRooms(rooms);
    };

    socket.on('getRoomsList', Event_allRooms);

    return () => {
      socket.off('getRoomsList', Event_allRooms);
    };
  }, [socket]);

  if (activeRooms.length < 1 && !roomClosedMessage) return null;

  return(
    <Box
      sx={{
        margin: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 540,
      }}
    >
      {roomClosedMessage && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="So about the room you were in..."
          withCloseButton
          variant="outline"
          onClose={() => setRoomClosedMessage(false)}
          sx={{ marginBottom: 15 }}
        >
          { roomClosedMessage == 1 && 'It was closed by the host. Maybe it\'s time to create your own!' }
          { roomClosedMessage == 2 && 'Room was closed successfully.' }
        </Alert>
      )}
      {activeRooms.length > 0 && (
        <Paper 
          shadow="xs" 
          radius={12} 
          withBorder
          sx={{
            backgroundColor:'#08080f',
            border: '1px solid #191921',
            padding: '30px 30px 0 30px',
            width: '100%',
          }}
        >
          <Text 
            size={25}
            align="center" 
            weight={300}
            color="#98989a"
            sx={{
              lineHeight: 1,
            }}
          >
            Active Rooms
          </Text>
          <ScrollArea
            scrollbarSize={8}
            sx={{
              paddingBottom: 15,
              marginTop: '30px',
              maxHeight: '250px',
            }}
            styles={{
              scrollbar: {
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              },
              thumb: {
                backgroundColor: '#2f2f3d',
                '&:hover': {
                  backgroundColor: '#2f2f3d !important',
                },
              },
            }}
          >
            <Stack align="stretch" spacing={0}>
              {
                activeRooms.map(room => (
                  <RoomItem
                    key={room.id}
                    room={room}
                  />
                ))
              }
            </Stack>
          </ScrollArea>
        </Paper>
      )}
    </Box>
  );
};

export default ActiveRooms;
