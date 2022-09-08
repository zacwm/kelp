import * as React from 'react';

import { useSocket } from 'contexts/socket.context';

import { IconAlertCircle } from '@tabler/icons';

import {
  Box,
  Stack,
  Paper,
  Alert,
  Text,
  Collapse,
  Button,
  TextInput,
  PasswordInput,
} from '@mantine/core';

const CreateRooms: React.FC = () => {
  const { socket } = useSocket();

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
        margin: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 540,
      }}
    >
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
          color="kelpPalette.7"
          onClose={() => setCreateRoomErrorMessage(null)}
          radius={12}
          styles={{
            root: {
              backgroundColor: '#191921',
              marginBottom: 30,
            },
            message: {
              color: '#98989a',
            },
          }}
        >
          {createRoomErrorMessage}
        </Alert>
      </Collapse>
      <Paper 
        shadow="xs" 
        radius={12} 
        p={30}
        sx={{
          backgroundColor: '#08080f',
          border: '1px solid #191921',
          width: '100%',
        }}
      >
        <Stack
          align="center"
          justify="center"
          spacing={0}
        >
          <Text
            size={25}
            weight={300}
            color="#98989a"
            sx={{
              lineHeight: 1,
            }}
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
              marginTop: 30,
            }}
          />
          <PasswordInput
            placeholder="Room password (optional)"
            disabled={createRoomPending}
            value={inputRoomPassword}
            onChange={(e) => setInputRoomPassword(e.currentTarget.value)}
            sx={{
              width: '100%',
              marginTop: 15,
            }}
          />
          <Button
            onClick={buttonCreateRoom}
            disabled={createRoomPending}
            sx={{
              width: 130,
              marginTop: 30,
            }}
          >
            Create Room
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateRooms;