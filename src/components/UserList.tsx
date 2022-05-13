import * as React from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Input from '@mui/material/Input';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

type Props = {
  socket: any;
  roomData: any;
  userId: string;
}

const UserList: React.FC<Props> = ({ socket, roomData, userId }) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [inputName, setInputName] = React.useState('');

  React.useEffect(() => {
    if (!roomData) return;
    setInputName(roomData.users.find(user => user.id === userId).name);
  }, [roomData]);

  const onNameSubmit = () => {
    if (!roomData) return;
    setIsEditingName(false);

    socket.emit('updateUserName', {
      roomId: roomData.id,
      name: inputName,
    });
  };

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
              {isEditingName ? (
                <Input
                  defaultValue={inputName}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  fullWidth
                />
              ): (
                <Typography sx={!(user.id === userId) ? { flex: 1 } : {}}>{user.name}</Typography>
              )}
              {user.id === userId && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ flex: 1 }}
                >
                  <Typography variant="body1" color="primary">You</Typography>
                  {
                    !isEditingName ? (
                      <EditIcon
                        onClick={() => setIsEditingName(true)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <React.Fragment>
                        <CloseIcon
                          onClick={() => {
                            setInputName(roomData.users.find(user => user.id === userId).name);
                            setIsEditingName(false);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                        <CheckIcon
                          onClick={onNameSubmit}
                          sx={{ cursor: 'pointer' }}
                        />
                      </React.Fragment>
                    )
                  }
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