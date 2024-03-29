import * as React from 'react';

import { useSocket } from 'contexts/socket.context';
import { useRoom } from 'contexts/room.context';
import { useUser } from 'contexts/user.context';

import { Box, Text, TextInput, ActionIcon, Stack, Group } from '@mantine/core';

import { IconCheck, IconPencil, IconX } from '@tabler/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

import RemoteIcon from '../remoteIcon';

const UserList: React.FC<any> = () => {
  const { socket } = useSocket();
  const { room } = useRoom();
  const { user } = useUser();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [inputName, setInputName] = React.useState('');

  React.useEffect(() => {
    if (!room) return;
    setInputName(room.users.find(u => u.id === user.id).name);
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
      align="stretch"
      justify="flex-start"
      sx={{
        gap: '15px',
      }}
    >
      {
        (room?.users || []).map((u, index) => (
          <React.Fragment key={index}>
            <Box sx={{ overflow: 'clip' }}>
              <Group
                align="center"
                position="apart"
                sx={{
                  gap: '15px',
                  flexWrap: 'nowrap',
                }}
              >
                <FontAwesomeIcon 
                  icon={u.permission == 'host' ? faCrown : faUser}
                  style={{ 
                    fontSize:'15px',
                  }}
                />
                {
                  isEditingName && u.id === user.id ? (
                    <TextInput
                      value={inputName}
                      onChange={(e) => setInputName(e.currentTarget.value)}
                    />
                  ) : (
                    <Text
                      size={14}
                      sx={u.id !== user.id ? { flex: 1 } : {}}
                    >
                      {u.name}
                    </Text>
                  )
                }
                {
                  (u.permission !== 'host' && u.id !== user.id) && (
                    <ActionIcon onClick={() => socket.emit('hostToggleController', u.id)}>
                      <RemoteIcon fill={u.permission == 'controller' ? '#3bd4ae' : '#fff'} />
                    </ActionIcon>
                  )
                }
                {u.id === user.id && (
                  <Group
                    align="center"
                    position="apart"
                    spacing={1}
                    sx={{
                      flex: 1,
                      flexWrap: 'nowrap',
                    }}
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
                        <Group
                          align="center"
                          position="apart"
                          sx={{
                            gap: '5px',
                          }}
                        >
                          { u.permission == 'controller' && <RemoteIcon fill="#3bd4ae" /> }
                          <ActionIcon onClick={() => setIsEditingName(true)}>
                            <IconPencil size={20} />
                          </ActionIcon>
                        </Group>
                      ) : (
                        <React.Fragment>
                          <ActionIcon
                            onClick={() => {
                              setInputName(room.users.find(us => us.id === user.id).name);
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
                  </Group>
                )}
              </Group>
            </Box>
          </React.Fragment>
        ))
      }
    </Stack>
  );
};

export default UserList;