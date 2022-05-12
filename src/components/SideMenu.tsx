import * as React from 'react';
import type { Socket } from 'socket.io-client';
import UserList from './UserList';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  socket: Socket;
  roomData: any;
  userId: string;
}

const SideMenu: React.FC<Props> = ({ socket, roomData, userId }) => {
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
                  Download torent
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
              <UserList roomData={roomData} userId={userId} />
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" component="h6" color="primary">Testing stuff</Typography>
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
                <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, 0)}>
                  [0] Status 1
                </Button>
                <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, 1)}>
                  [1] Status 2
                </Button>
                <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, 2)}>
                  [2] Download torrent
                </Button>
                <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, 3)}>
                  [3] Stop torrent
                </Button>
                <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, 4)}>
                  [4] Convert test mkv
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
          <Link
            component="a"
            href="/"
            variant="caption"
          >
            kelp
          </Link>
          <Typography variant="caption" component="span">
            Version 1.0.0
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
      </Stack>
    </Paper>
  );
};

export default SideMenu;