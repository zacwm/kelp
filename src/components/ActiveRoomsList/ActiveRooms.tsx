import * as React from 'react';
import { useRouter } from 'next/router';

import LockedRoom from './LockedRoom';
import UnlockedRoom from './UnlockedRoom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { IconAlertCircle } from '@tabler/icons';

import { Paper, Alert, Text, ScrollArea } from '@mantine/core';

type Props = {
  socket: any;
}

const ActiveRooms: React.FC<Props> = ({ socket }) => {
  const router = useRouter();
  const [roomClosedMessage, setRoomClosedMessage] = React.useState(undefined);
  const [activeRooms, setActiveRooms] = React.useState([]);
  const { roomclosed } = router.query;

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
        mx: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%', 
      }}    
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
              p="md" 
              withBorder
              sx={{ backgroundColor:'#08080f'}}
            >
              <Text size={25} mb={4} align="center">
                  Active rooms
                <ScrollArea 
                  scrollbarSize={8}
                  style={{ height: 168 }}
                >
                  
                  <Stack alignItems="stretch" spacing={2}>
                    {activeRooms.length === 0 && <Text>No rooms found...</Text>}
                    {
                      activeRooms.map(room => (
                        <React.Fragment key={room.id}>
                          {room.hasPassword ? (
                            <LockedRoom room={room} />
                          ) : (
                            <UnlockedRoom room={room} />
                          )}
                          {activeRooms.length - 1 !== activeRooms.indexOf(room)}
                        </React.Fragment>
                      ))
                    }
                  </Stack>
                </ScrollArea>
              </Text>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActiveRooms;
