import * as React from 'react';
import type { Socket } from 'socket.io-client';

import {
  Popover,
  ActionIcon,
} from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import UserList from '../../UserList';

type Props = {
  socket: Socket;
  userId: string;
};

const RoomsPopover: React.FC<Props> = ({ socket, userId }) => {

  return (
    <Popover width={300} position="bottom" shadow="md">
      <Popover.Target>
        <ActionIcon>
          <FontAwesomeIcon 
            icon={faUser}
          />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <UserList socket={socket} userId={userId} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default RoomsPopover;