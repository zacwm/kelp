import * as React from 'react';

import { useRoom } from '../contexts/room.context';

import Stack from '@mui/material/Stack';

import { Box, Divider, Text, TextInput, ActionIcon } from '@mantine/core';
import { IconCheck, IconPencil, IconUser, IconX } from '@tabler/icons';

type Props = {
  socket: any;
  userId: string;
}

const UserList: React.FC<Props> = ({ socket, userId }) => {
  const { room } = useRoom();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [inputName, setInputName] = React.useState('');

  React.useEffect(() => {
    if (!room) return;
    setInputName(room.users.find(user => user.id === userId).name);
  }, [room]);

  const onNameSubmit = () => {
    if (!room) return;
    setIsEditingName(false);

    socket.emit('updateUserName', {
      roomId: room.id,
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
        (room?.users || []).map((user, index) => (
          <React.Fragment key={index}>
            <Box sx={{ p: 1, overflow: 'clip' }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <IconUser size={20} />
                {isEditingName && user.id === userId ? (
                  <TextInput
                    value={inputName}
                    onChange={(e) => setInputName(e.currentTarget.value)}
                  />
                ) : (
                  <Text sx={!(user.id === userId) ? { flex: 1 } : {}}>{user.name}</Text>
                )}
                {user.id === userId && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ flex: 1 }}
                  >
                    <Text
                      weight={700}
                      sx={(theme) => ({
                        whiteSpace: 'nowrap', 
                        color: theme.colors.brand[7],
                      })}
                    >
                      You
                    </Text>
                    {
                      !isEditingName ? (
                        <ActionIcon onClick={() => setIsEditingName(true)}>
                          <IconPencil size={20} />
                        </ActionIcon>
                      ) : (
                        <React.Fragment>
                          <ActionIcon
                            onClick={() => {
                              setInputName(room.users.find(user => user.id === userId).name);
                              setIsEditingName(false);
                            }}
                          >
                            <IconX size={20} />
                          </ActionIcon>
                          <ActionIcon onClick={onNameSubmit}>
                            <IconCheck size={20} />
                          </ActionIcon>
                        </React.Fragment>
                      )
                    }
                  </Stack>
                )}
              </Stack>
            </Box>
            { (room?.users || []).length - 1 !== index && <Divider my="sm" /> }
          </React.Fragment>
        ))
      }
    </Stack>
  );
};

export default UserList;