import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

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
      <Paper elevation={4} sx={{
        padding: 2,
      }}>
        <Stack alignItems="center" spacing={2}>
          <Typography variant="h5" component="h5" color="primary">
            This room requires a password...
          </Typography>
          <TextField
            id="input_createRoom_roomPassword"
            label="Room password"
            variant="outlined"
            fullWidth
            value={inputRoomPassword}
            onChange={(e) => setInputRoomPassword(e.target.value)}
            type="password"
            autoComplete="off"
            disabled={isLoading}
          />
          <Button
            variant="contained"
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