import * as React from 'react';
import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import {IconAlertCircle, IconLock, IconLockOpen } from '@tabler/icons';

import { Button, Paper, Alert, Text, Divider } from '@mantine/core';

type Props = {
  socket: any;
}

const ActiveRooms: React.FC<Props> = ({ socket }) => {
  const router = useRouter();
  const [roomClosedMessage, setRoomClosedMessage] = React.useState(false);
  const [activeRooms, setActiveRooms] = React.useState([]);
  const { roomclosed } = router.query;

  React.useEffect((): void => {
    if (roomclosed) {
      router.push('/', undefined, { shallow: true });
      setRoomClosedMessage(true);
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
                  It was closed by the host. Maybe it&apos;s time to create your own!
                </Alert>
              )}
              <Paper shadow="xs" p="md" withBorder sx={{
                padding: 2,
              }}>
                <Text size={25} mb={4} align="center">
                  Active rooms
                </Text>
                <Stack alignItems="stretch" spacing={2}>
                  {activeRooms.length === 0 && <Text>No rooms found...</Text>}
                  {
                    activeRooms.map(room => (
                      <React.Fragment key={room.id}>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center" 
                          spacing={2}
                        >
                          {room.hasPassword ? (
                            <IconLock size={40} />
                          ) : (
                            <IconLockOpen size={40} />
                          )}
                          <Stack
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start" 
                            spacing={0}
                            sx={{ flex: 1 }}
                          >
                            <Text size="xl" weight={700}>
                              {room.name}
                            </Text>
                            <Text size="sm" italic>
                              {room.status}
                            </Text>
                          </Stack>
                          <Button onClick={() => router.push(`/room/${room.id}`)}>Join Room</Button>
                        </Stack>
                        {activeRooms.length - 1 !== activeRooms.indexOf(room) && <Divider />}
                      </React.Fragment>
                    ))
                  }
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
    );
};

export default ActiveRooms;
