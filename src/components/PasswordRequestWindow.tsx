import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type Props = {
  open: boolean;
  passwordResponse: (password: string) => void;
}

const PasswordRequestWindow: React.FC<Props> = ({ open, passwordResponse }) => {
  const [inputPassword, setInputPassword] = React.useState('');

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
      open={open}
    >
      <Paper>
        <Typography variant="h2" component="h1" color="primary">
          Hello
        </Typography>
      </Paper>
    </Backdrop>
  );
};

export default PasswordRequestWindow;