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
  const [formattedUsers, setFormattedUsers] = React.useState([]);

  React.useEffect(() => {
    if (!roomData) return;
    if (!roomData.users) return;
    const newUsersList = [];
    // Format users, and if no name, add a count to make it unique.
    let nullUserCount = 0;
    for (let i = 0; i < roomData.users.length; i++) {
      if (!roomData.users[i].name) nullUserCount++;
      newUsersList.push({
        ...roomData.users[i],
        name: roomData.users[i].name || `User ${nullUserCount}`,
        isSelf: roomData.users[i].id === userId,
      });
    }
    // Sort isSelf to top
    newUsersList.sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return 0;
    });
    setFormattedUsers(newUsersList);
  }, [roomData, userId]);
  
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
              <Typography sx={!user.isSelf ? { flex: 1 } : {}}>{user.name}</Typography>
              {user.isSelf && (
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