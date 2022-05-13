import * as React from 'react';
import type { Socket } from 'socket.io-client';
import UserList from './UserList';

import Backdrop from '@mui/material/Backdrop';
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
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  socket: Socket;
  roomData: any;
  userId: string;
  videoState: any;
  videoData: any;
}

const SideMenu: React.FC<Props> = ({ socket, roomData, userId, videoState, videoData }) => {
  const [torrentPrompt, setTorrentPrompt] = React.useState(false);
  const [inputTorrentUrl, setInputTorrentUrl] = React.useState('');

  const onTorrentStart = () => {
    if (!socket) return;
    if (!roomData) return;
    if (!inputTorrentUrl) return;
    socket.emit('roomStartTorrent', {
      id: roomData.id,
      url: inputTorrentUrl,
    }, (res) => {
      if (res.error) alert(res.error);
      setTorrentPrompt(false);
    });
  };

  // TODO: Testing stuff below
  const [inputTimePosition, setInputTimePosition] = React.useState('');
  const [inputSelect, setInputSelect] = React.useState('');

  const buttonSubmitTimeChange = () => {
    socket.emit('videoChangePlaybackTime', {
      id: roomData.id,
    }, parseInt(inputTimePosition));
  };

  const handleChange = (event: SelectChangeEvent) => {
    setInputSelect(event.target.value as string);
  };

  React.useEffect(() => {
    if (!videoState?.timePosition) return;
    setInputTimePosition(Math.floor(videoState.timePosition || 0).toString());
  }, [videoState]);
  
  return (
    <React.Fragment>
      <Backdrop
        open={[0, 1].includes(videoData?.statusCode) && torrentPrompt}
        sx={{
          zIndex: 9999,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4
          }}
        >
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="flex-start"
            spacing={2}
          >
            <Typography variant="h5" component="h5">
              Start a torrent download...
            </Typography>
            <TextField
              id="torrent-input"
              label="Torrent or magnet link"
              variant="outlined"
              fullWidth
              value={inputTorrentUrl}
              onChange={(e) => setInputTorrentUrl(e.target.value)}
            />
            <Typography variant="body1" component="p" color="red">
              If the room already has a torrent playing, using this will delete the current torrent and start a new one.
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <Button variant="contained" onClick={() => setTorrentPrompt(false)}>
                Close
              </Button>
              <Button variant="contained" onClick={onTorrentStart}>
                Start Download
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Backdrop>

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
            maxHeight: '100vh',
            overflowY: 'auto',
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
                  { [0, 1].includes(videoData?.statusCode) && (
                    <Button variant="contained" onClick={() => setTorrentPrompt(true)}>
                      Download torrent
                    </Button>
                  ) }
                  { ![0, 1].includes(videoData?.statusCode) && (
                    <Button variant="contained">
                      Stop Download
                    </Button>
                  ) }
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
                <UserList socket={socket} roomData={roomData} userId={userId} />
              </AccordionDetails>
            </Accordion>
          </Box>
          <Stack
            direction="column"
            alignItems="stretch"
            justifyContent="center"
          >
            <Accordion disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="subtitle2" component="p">Testing buttons</Typography>
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
                    disabled={videoState?.playing}
                  />
                  <Button variant="contained" onClick={buttonSubmitTimeChange} disabled={videoState?.playing}>
                    Set seconds
                  </Button>
                  <FormControl fullWidth>
                    <InputLabel id="test-action-select">Action type</InputLabel>
                    <Select
                      labelId="test-action-select"
                      id="test-action-select"
                      value={inputSelect}
                      label="Action type"
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value={1}>[1] Reset room</MenuItem>
                      <MenuItem value={2}>[2] Convert test mkv</MenuItem>
                      <MenuItem value={3}>[3] Convert test mp4</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={() => socket.emit('playerTest', roomData.id, parseInt(inputSelect))}>
                    Run action
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="subtitle2" component="p">Extra info</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack
                  direction="column"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  {
                    videoData?.extra ? Object.keys(videoData?.extra || {}).map((key) => (
                      <Typography variant="body2" component="span" key={`extra_${key}`}>
                        {key}: {videoData?.extra[key]}
                      </Typography>
                    )) : (
                      <Typography variant="body1" component="span" color="primary">
                        No information available
                      </Typography>
                    )
                  }
                </Stack>
              </AccordionDetails>
            </Accordion>
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
        </Stack>
      </Paper>
    </React.Fragment>
  );
};

export default SideMenu;