import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import io from 'socket.io-client';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';


const Home: NextPage = () => {
  const [socket, setSocket] = useState(null);
  const [activeRooms, setActiveRooms] = useState([
    /* Example format:
    {
      id: "sad-cloud",
      name: 'Room 1',
      hasPassword: false,
      status: 'downloading',
    }
    */
  ]);

  const [inputRoomName, setInputRoomName] = useState('');
  const [inputRoomPassword, setInputRoomPassword] = useState('');

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const Event_allRooms = (rooms) => {
      setActiveRooms(rooms);
    };

    socket.on('allRooms', Event_allRooms);

    return () => {
      socket.off('allRooms', Event_allRooms);
    };
  }, [socket]);

  const buttonCreateRoom = () => {
    if (!socket) return;
    socket.emit('createRoom', {
      name: inputRoomName,
      password: inputRoomPassword,
    }, (res) => {
      console.dir(res);
    });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          my: 4,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" component="h1" color="primary" mb={5}>
          kelp
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} mb={4}>
            <Paper elevation={2} sx={{
              padding: 2,
            }}>
              <Typography variant="h5" component="h5" mb={1}>
                Create a room
              </Typography>
              <Stack alignItems="center" spacing={2}>
                <TextField
                  id="input_createRoom_roomName"
                  label="Room name"
                  variant="outlined"
                  fullWidth
                  value={inputRoomName}
                  onChange={(e) => setInputRoomName(e.target.value)}
                />
                <TextField
                  id="input_createRoom_roomPassword"
                  label="Room password (optional)"
                  variant="outlined"
                  fullWidth
                  value={inputRoomPassword}
                  onChange={(e) => setInputRoomPassword(e.target.value)}
                  type="password"
                />
                <Button variant="contained" onClick={buttonCreateRoom}>Create Room</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{
              padding: 2,
            }}>
              <Typography variant="h5" component="h5" mb={1}>
                Active rooms
              </Typography>
              <Stack alignItems="stretch" spacing={2}>
                {activeRooms.length === 0 && <Typography variant="body1">No rooms found...</Typography>}
                {
                  activeRooms.map(room => (
                    <Paper key={room.id} elevation={10} sx={{
                      px: 2,
                      py: 1,
                    }}>
                      <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center" 
                        spacing={2}
                      >
                        {room.hasPassword ? (
                          <LockOutlinedIcon sx={{ fontSize: 40 }} />
                        ) : (
                          <LockOpenOutlinedIcon sx={{ fontSize: 40 }} />
                        )}
                        <Stack
                          direction="column"
                          justifyContent="center"
                          alignItems="flex-start" 
                          spacing={0}
                          sx={{ flex: 1 }}
                        >
                          <Typography variant="h6" component="h6">
                            {room.name}
                          </Typography>
                          <Typography variant="body2" component="p">
                            Status: {room.status}
                          </Typography>
                        </Stack>
                        <Button variant="contained">Join Room</Button>
                      </Stack>
                    </Paper>
                  ))
                }
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{
              padding: 2,
            }}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="caption" component="span">
                  Version: 1.0.0
                </Typography>
                <Link
                  href="https://github.com/zacimac/kelp"
                  target="_blank"
                  rel="noopener"
                  variant="caption"
                  component="span"
                >
                  GitHub
                </Link>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;