import * as React from 'react';

import RemoteIcon from '../remoteIcon';

import { useSocket } from 'contexts/socket.context';
import { useRoom } from 'contexts/room.context';
import { useUser } from 'contexts/user.context';

import {
  ActionIcon,
  Popover,
  Text,
  Stack,
  Button,
} from '@mantine/core';
import ActivityList from './ActivityList';

const ControllerPopover: React.FC = () => {
  const { socket } = useSocket();
  const { room } = useRoom();
  const { user } = useUser();

  const [logData, setLogData] = React.useState<any>([]);

  React.useEffect((): any => {
    if (!socket) return;
    
    const Event_updateEvents = (events) => {
      setLogData(events);
    };

    socket.on('updateEvents', Event_updateEvents);

    return () => {
      socket.off('updateEvents', Event_updateEvents);
    };
  }, [socket]);

  return (
    <Popover width={300} position="bottom" shadow="md">
      <Popover.Target>
        <ActionIcon>
          <RemoteIcon fill="#fff" />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        sx={{
          borderRadius: 12,
          backgroundColor: '#2f2f3d',
          border: 'none',
        }}
      >
        <Stack>
          <Text>Controller Activity</Text>
          <ActivityList logData={logData} />
          { user && ['host', 'controller'].includes(user.permission) && (
            <Button onClick={() => socket.emit('closeRoom', room.id) }>
              Close room
            </Button>
          ) }
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ControllerPopover;