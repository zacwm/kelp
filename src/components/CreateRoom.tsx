import * as React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { IconAlertCircle } from '@tabler/icons';

import { Paper, Alert, Text, Collapse, Button, TextInput, PasswordInput } from '@mantine/core';

type Props = {
  socket: any;
}

const CreateRooms: React.FC<Props> = ({ socket }) => {
  const [createRoomPending, setCreateRoomPending] = React.useState(false);
  const [createRoomErrorMessage, setCreateRoomErrorMessage] = React.useState(null);
  
  const [inputRoomName, setInputRoomName] = React.useState<string>('');
  const [inputRoomPassword, setInputRoomPassword] = React.useState<string>('');

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const buttonCreateRoom = async (): Promise<void> => {
    if (!socket) return;
    if (createRoomPending) return;
    setCreateRoomPending(true);
    if (createRoomErrorMessage) {
      setCreateRoomErrorMessage(null);
      await timeout(300);
    }
    socket.emit('createRoom', {
      name: inputRoomName,
      password: inputRoomPassword,
    }, (res) => {
      if (res.roomId) return window.location.href = inputRoomPassword ? `/room/${res.roomId}?password=${inputRoomPassword}` : `/room/${res.roomId}`;
      setCreateRoomPending(false);
      if (res.error) return setCreateRoomErrorMessage(res.error);
      // If unknown error
      setCreateRoomErrorMessage('Unknown error');
      setCreateRoomPending(false);
    });
  };
  
  return(
    <Box
      sx={{
        mx: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 540,
        height: '100%',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper 
            shadow="xs" 
            radius={12} 
            p="md" 
            sx={{
              backgroundColor: '#08080f',
              border: '1px solid #191921',
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Text
                size={25}
                weight={300}
                color="#98989a"
              >
                Create Room
              </Text>
              <TextInput
                placeholder="Room name"
                disabled={createRoomPending}
                value={inputRoomName}
                onChange={(e) => setInputRoomName(e.currentTarget.value)}
                sx={{ 
                  width: '100%',
                }}
              />
              <PasswordInput
                placeholder="Room password (optional)"
                disabled={createRoomPending}
                value={inputRoomPassword}
                onChange={(e) => setInputRoomPassword(e.currentTarget.value)}
                sx={{ width: '100%', mb: 2 }}
              />
              <Button
                onClick={buttonCreateRoom}
                disabled={createRoomPending}
                sx={{
                  width: 130,
                }}
              >
                Create Room
              </Button>
            </Stack>
            <Collapse
              in={createRoomErrorMessage} 
              sx={{
                width: '100%',
              }}
            >
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Oh, uhh..."
                withCloseButton
                variant="outline"
                color="red"
                onClose={() => setCreateRoomErrorMessage(null)}
                sx={{ marginTop: 15 }}
              >
                {createRoomErrorMessage}
              </Alert>
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateRooms;