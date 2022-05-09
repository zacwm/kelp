import * as React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

import PasswordRequestWindow from '../../components/PasswordRequestWindow';
import Player from '../../components/Player';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Room: NextPage = () => {
  const router = useRouter();
  const { id, password } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [loadingRoomData, setLoadingRoomData] = React.useState(true);
  const [roomData, setRoomData] = React.useState(null);
  const [roomNotFound, setRoomNotFound] = React.useState(false);
  const [openPRW, setOpenPRW] = React.useState(false);

  React.useEffect((): any => {
    const newSocket = io(`http://${window.location.hostname}:3000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  React.useEffect((): any => {
    if (!socket) return;
    if (!id) return;
    setLoadingRoomData(true);
    if (password) {
      router.push(`/room/${id}`, undefined, { shallow: true });
    }
    socket.emit('joinRoom', { id, password }, (res) => {
      console.dir(res);
      setLoadingRoomData(false);
      if (res.roomNotFound) return setRoomNotFound(true);
      if (res.passwordRequest) return setOpenPRW(true);
      if (res.error) return;
      setRoomData(res.room);
    });
  }, [socket, id]);

  const passwordSubmit = (password: string, callback: any): void => {
    if (!socket) return;
    if (!id) return;
    setLoadingRoomData(true);
    socket.emit('joinRoom', { id, password }, (res) => {
      console.dir(res);
      setLoadingRoomData(false);
      if (res.roomNotFound) return setRoomNotFound(true);
      if (res.error) return callback(res);
      setOpenPRW(false);
      setRoomData(res.room);
    });
  };

  React.useEffect((): any => {
    if (!socket) return;
    /*
    const Event_room = (room) => {
      setRoomData(room);
    };
    socket.on('room', Event_room);
    return () => {
      socket.off('room', Event_room);
    };
    */
  }, [socket]);
  
  return (
    <React.Fragment>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={roomNotFound}
      >
        <Paper sx={{ px: 4, py: 2 }}>
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <Typography variant="h4" component="h4" mb={1}>
              Room not found
            </Typography>
            <Button variant="contained" onClick={() => {
              router.push('/');
            }}>
              Go to menu
            </Button>
          </Stack>
        </Paper>
      </Backdrop>
      <PasswordRequestWindow
        open={openPRW}
        isLoading={loadingRoomData}
        passwordSubmit={passwordSubmit}
      />
      <Box
        position="fixed"
        top={0}
        height="100vh"
        width="100vw"
        display="flex"
        flexDirection="column"
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          sx={{
            height: '100%',
          }}
        >
          <Grid item xs={9.5}>
            <Player roomData={roomData} />
          </Grid>
          <Grid 
            item 
            xs={2.5} 
            sx={{
              height: '100%',
            }}
          >
            <Paper
              elevation={2}
              square
            >
              <Stack
                direction="column"
                alignItems="stretch"
                justifyContent="space-between"
                sx={{
                  height: '100vh',
                }}
              >
                <Box>
                  <Accordion defaultExpanded disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant="h6" component="h6" color="primary">Room</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        label="Torrent URL"
                        fullWidth
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion defaultExpanded disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <Typography variant="h6" component="h6" color="primary">Users</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack
                        direction="column"
                        alignItems="stretch"
                        justifyContent="flex-start"
                        spacing={1}
                      >
                        <Paper elevation={5} sx={{ p: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <AccountCircleIcon />
                            <Typography sx={{ flex: 1 }}>User 1</Typography>
                          </Stack>
                        </Paper>
                        <Paper elevation={5} sx={{ p: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <AccountCircleIcon />
                            <Typography sx={{ flex: 1 }}>User 1</Typography>
                          </Stack>
                        </Paper>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{
                    p: 1,
                    borderTop: '1px solid #555',
                  }}
                >
                  <Typography variant="caption" component="span" color="primary">
                    Kelp
                  </Typography>
                  <Typography variant="caption" component="span">
                    Version 1.0.0
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default Room;