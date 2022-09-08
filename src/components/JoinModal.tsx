import * as React from 'react';
import { useRouter } from 'next/router';

import { useSocket } from 'contexts/socket.context';
import { useRoom } from 'contexts/room.context';

import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

import {
  Box,
  Text,
  Paper,
  Transition,
  Stack,
  Loader,
  Image,
  Button,
  TextInput,
  PasswordInput,
} from '@mantine/core';
import HomeFooter from './HomeFooter';

type Props = {
  setUserId: (id: any) => void;
};

const JoinModal: React.FC<Props> = ({ setUserId }) => {
  const router = useRouter();
  const { id, password } = router.query;

  const { socket } = useSocket();
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
    });
  };

  const inputs = (
    <React.Fragment>
      <Stack align="center" spacing={0}>
        <Text
          size={23}
          color="#98989a"
          weight={300}
          sx={{
            lineHeight: 1,
            marginBottom: 30,
          }}
        >
          Who&apos;s Watching?
        </Text>
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
            sx={{
              width: '100%',
              marginTop: 15,
            }}
          />
        ) }
        {/* And the button from the home page. */}
        <Button
          onClick={handleSubmit}
          disabled={isLoadingSubmit}
          sx={{ marginTop: 30 }}
        >
          Confirm
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
  );

  return (
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
          <Image 
            src='/kelp-gradient-text.svg'
            height={70}
            fit='contain'
            sx={{
              position: 'absolute',
              top: '18%',
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          />
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
                  radius={12} 
                  p={30}
                  sx={{
                    width: 500,
                    backgroundColor: '#08080f',
                    border: '1px solid #191921',
                  }}
                >
                  {
                    roomSummary.error ? (
                      <Stack align="center">
                        <Text size={23}>{roomSummary.error}</Text>
                        <Button onClick={() => router.push('/')} >
                          Go back
                        </Button>
                      </Stack>
                    ) : inputs
                  }
                </Paper>
              )
            }
          </Stack>
          <HomeFooter />
        </Box>
      )}
    </Transition>
  );
};

export default JoinModal;