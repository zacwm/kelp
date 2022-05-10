import * as React from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

type Props = {
  users: any;
}

const UserList: React.FC<Props> = ({ users }) => {
  const [formattedUsers, setFormattedUsers] = React.useState([]);

  React.useEffect(() => {
    setFormattedUsers([]);
    if (!users) return;
    let nullUserCount = 0;
    for (let i = 0; i < users.length; i++) {
      if (!users[i].name) nullUserCount++;
      setFormattedUsers([...formattedUsers, {
        ...users[i],
        name: users[i].name || `User ${nullUserCount}`,
      }]);
    }
  }, [users]);
  
  return (
    <Stack
      direction="column"
      alignItems="stretch"
      justifyContent="flex-start"
      spacing={1}
    >
      {
        formattedUsers.map((user, index) => (
          <Paper key={index} elevation={5} sx={{ p: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <AccountCircleIcon />
              <Typography sx={{ flex: 1 }}>User 1</Typography>
            </Stack>
          </Paper>
        ))
      }
    </Stack>
  );
};

export default UserList;