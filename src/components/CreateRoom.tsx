import * as React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import {IconAlertCircle } from '@tabler/icons';

import { Paper, Alert, Text, Collapse} from '@mantine/core';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';
import Button from './Button';

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
      setCreateRoomPending(false);
      if (res.error) return setCreateRoomErrorMessage(res.error);
      if (res.roomId) {
        window.location.href = inputRoomPassword ? `/room/${res.roomId}?password=${inputRoomPassword}` : `/room/${res.roomId}`;
      } else {
        setCreateRoomErrorMessage('Unknown error');
      }
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
        width: '100%',
        height: '100%',
        maxWidth: '32rem',
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
                className='light'
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