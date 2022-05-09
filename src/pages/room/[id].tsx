import * as React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

import PasswordRequestWindow from '../../components/PasswordRequestWindow';
import Player from '../../components/Player';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Room: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [socket, setSocket] = React.useState(null);
  const [loadingRoomData, setLoadingRoomData] = React.useState(true);
  const [roomData, setRoomData] = React.useState(null);
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
    socket.emit('joinRoom', { id }, (res) => {
      console.dir(res);
      setLoadingRoomData(false);
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
          spacing={0.5}
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          sx={{
            height: '100%',
          }}
        >
          <Grid item xs={9.5}>
            <Player roomId={id} />
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
                      <Typography>Room</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      
                    </AccordionDetails>
                  </Accordion>
                  <Accordion defaultExpanded disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <Typography>Users</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                      </Typography>
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