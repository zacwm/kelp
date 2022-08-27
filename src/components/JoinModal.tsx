import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useRoom } from '../contexts/room.context';

import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

import { Box, Text, Paper, Button, TextInput, PasswordInput, Transition, Stack, Loader } from '@mantine/core';

type Props = {
  socket: any;
  setUserId: (id: any) => void;
  setMenuVisible: () => void; // TODO: This will be gone soon... This is just temporary until the new dropdown menus are implemented
}

const JoinModal: React.FC<Props> = ({ socket, setUserId, setMenuVisible }) => {
  const router = useRouter();
  const { id, password } = router.query;

  const { room, setRoom } = useRoom();

  const [inputName, setInputName] = React.useState<string>('');
  const [inputPassword, setInputPassword] = React.useState<string>('');
  const [alreadyProvidedPassword, setAlreadyProvidedPassword] = React.useState<boolean>(false);

  const [isWaitingForSummary, setIsWaitingForSummary] = React.useState<boolean>(true);
  const [roomSummary, setRoomSummary] = React.useState<any>(null);

  const [isLoadingSubmit, setIsLoadingSubmit] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect((): any => {
    if (!socket) return;
    if (!id) return;
    if (room) return;
    if (password) {
      setInputPassword(password.toString());
      setAlreadyProvidedPassword(true);
      router.push(`/room/${id}`, undefined, { shallow: true });
    }
    socket.emit('getRoomSummary', id, (res) => {
      setRoomSummary(res);
      setIsWaitingForSummary(false);
    });
  }, [socket, id]);

  const handleSubmit = (): void => {
    if (isLoadingSubmit) return;
    setIsLoadingSubmit(true);
    socket.emit('joinRoom', { id, name: inputName, password: inputPassword }, (res) => {
      setIsLoadingSubmit(false);
      if (res.error) return setRoomSummary({ error: 'Room does not exist' });
      if (res.userError) return setSubmitError(res.userError);
      setUserId(res.user);
      setRoom(res.room);
      setMenuVisible();
    });
  };

  const inputs = (
    <React.Fragment>
      <Stack align="center">
        <Text size={23} sx={{ marginBottom: '10px' }}>Who's watching?</Text>
        {/*
          TODO: Need to change to use the style of the inputs on the home page.
          Best to turn them into it's own component once pushed though.
        */}
        <TextInput
          placeholder="Name"
          value={inputName}
          onChange={(e) => setInputName(e.currentTarget.value)}
          disabled={isLoadingSubmit}
          sx={{ width: '100%' }}
        />
        {/* Same for password input... */}
        { (!alreadyProvidedPassword && roomSummary?.hasPassword) && (
          <PasswordInput
            placeholder="Room Password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.currentTarget.value)}
            disabled={isLoadingSubmit}
            sx={{ width: '100%' }}
          />
        ) }
        {/* And the button from the home page. */}
        <Button
          size="md"
          variant="filled"
          onClick={handleSubmit}
          disabled={isLoadingSubmit}
        >
          Enter
        </Button>
      </Stack>
      <Collapse
        in={submitError !== null && submitError !== ''} 
        sx={{
          width: '100%',
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{
            mt: 2,
            width: '100%',
          }}
        >
          {submitError}
        </Alert>
      </Collapse>
    </React.Fragment>
  )

  return (
    <React.Fragment>
      <Head>
        <title>kelp - room</title>
      </Head>
      <Transition
        mounted={!room}
        transition="fade"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <Box
            style={styles}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              color: '#fff',
              zIndex: 9999,
              background: '#08080f',
            }}
          >
            <Stack
              align="center"
              justify="center"
              sx={{
                width: '100%',
                height: '100%'
              }}
            >
              {
                isWaitingForSummary ? (
                  <Loader size="xl" />
                ) : (
                  <Paper
                    shadow="xs"
                    p="md"
                    sx={{
                      width: 600,
                      backgroundColor: '#08080f',
                      border: '2px solid #191921',
                      borderRadius: 12,
                    }}
                  >
                    {
                      roomSummary.error ? (
                        <Stack align="center">
                          <Text size={23}>{roomSummary.error}</Text>
                          <Button
                            size="md"
                            variant="filled"
                            onClick={() => router.push('/')}
                          >
                            Go back
                          </Button>
                        </Stack>
                      ) : inputs
                    }
                  </Paper>
                )
              }
            </Stack>
          </Box>
        )}
      </Transition>
    </React.Fragment>
  );
};

export default JoinModal;