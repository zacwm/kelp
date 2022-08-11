import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

import { Text, Paper, Button, PasswordInput } from '@mantine/core';

type Props = {
  open: boolean;
  isLoading: boolean;
  passwordSubmit: any;
}

const PasswordRequestWindow: React.FC<Props> = ({ open, isLoading, passwordSubmit }) => {
  const [passwordSubmitError, setPasswordSubmitError] = React.useState(null);

  const [inputRoomPassword, setInputRoomPassword] = React.useState('');

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  React.useEffect(() => {
    setPasswordSubmitError(null);
  }, [open]);

  const handlePasswordSubmit = (): void => {
    setPasswordSubmitError(null);
    passwordSubmit(inputRoomPassword, async (res) => {
      if (!res.error) return;
      if (passwordSubmitError) {
        setPasswordSubmitError(null);
        await timeout(300);
      }
      setPasswordSubmitError(res.error);
    });
  };

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
      open={open}
    >
      <Paper shadow="xs" p="md" sx={{ width: '400px' }}>
        <Text size={23} sx={{ marginBottom: '10px' }}>This room requires a password...</Text>
        <Stack alignItems="center" spacing={2}>
          <PasswordInput
            label="Room password"
            value={inputRoomPassword}
            onChange={(e) => setInputRoomPassword(e.currentTarget.value)}
            disabled={isLoading}
            sx={{ width: '100%' }}
          />
          <Button
            size="md"
            variant="filled"
            onClick={handlePasswordSubmit}
            disabled={isLoading}
          >
            Enter
          </Button>
        </Stack>
        <Collapse
          in={passwordSubmitError !== null && passwordSubmitError !== ''} 
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
            {passwordSubmitError}
          </Alert>
        </Collapse>
      </Paper>
    </Backdrop>
  );
};

export default PasswordRequestWindow;