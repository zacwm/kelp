import * as React from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';

type Props = {
  roomData: any;
  userId: string;
}

const UserList: React.FC<Props> = ({ roomData, userId }) => {
  return (
    <Stack
      direction="column"
      alignItems="stretch"
      justifyContent="flex-start"
      spacing={1}
    >
      {
        (roomData?.users || []).map((user, index) => (
          <Paper key={index} elevation={5} sx={{ p: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <AccountCircleIcon />
              <Typography sx={!(user.id === userId) ? { flex: 1 } : {}}>{user.name}</Typography>
              {user.id === userId && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ flex: 1 }}
                >
                  <Typography variant="body1" color="primary">You</Typography>
                  <EditIcon sx={{ cursor: 'pointer' }}/>
                </Stack>
              )}
            </Stack>
          </Paper>
        ))
      }
    </Stack>
  );
};

export default UserList;