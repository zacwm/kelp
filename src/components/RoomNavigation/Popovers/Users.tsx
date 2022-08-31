import * as React from 'react';
import type { Socket } from 'socket.io-client';

import {
  Popover,
  ActionIcon,
  Indicator,
} from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

import UserList from '../../UserList';
import { useRoom } from '../../../contexts/room.context';

type Props = {
  socket: Socket;
  userId: string;
};

const UserPopover: React.FC<Props> = ({ socket, userId }) => {
  const { room } = useRoom();

  return (
    <Popover width={300} position="bottom" shadow="md">
      <Popover.Target>
        <ActionIcon>
          <Indicator inline label={(room?.users || []).length} size={16}>
            <FontAwesomeIcon 
              icon={faUser}
              style={{ 
                fontSize:'22px', 
                marginRight: '8px',
              }} 
            />
          </Indicator>
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <UserList socket={socket} userId={userId} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default UserPopover;