import * as React from 'react';
import type { Socket } from 'socket.io-client';
import UserList from './UserList';

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

type Props = {
  socket: Socket;
  roomData: any;
}

const SideMenu: React.FC<Props> = ({ socket, roomData }) => {
  const [inputTimePosition, setInputTimePosition] = React.useState('');

  const buttonSubmitTimeChange = () => {
    socket.emit('videoChangePlaybackTime', {
      id: roomData.id,
    }, parseInt(inputTimePosition));
  };
  
  return (
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
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" component="h6" color="primary">Room settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <TextField
                  label="Torrent URL"
                  fullWidth
                />
                <Button variant="contained">
                  Set torrent
                </Button>
              </Stack>
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
              <UserList users={roomData?.users} />
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" component="h6" color="primary">Playback (testing)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <TextField
                  label="seconds"
                  value={inputTimePosition}
                  onChange={(e) => {
                    setInputTimePosition(e.target.value);
                  }}
                  fullWidth
                />
                <Button variant="contained" onClick={buttonSubmitTimeChange}>
                  Set
                </Button>
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
            kelp
          </Typography>
          <Typography variant="caption" component="span">
            Version 1.0.0
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SideMenu;