import * as React from 'react';

import {
  Popover,
  ActionIcon,
  Indicator,
} from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

import UserList from './UserList';
import { useRoom } from '../../../../contexts/room.context';

type Props = {
  userId: string;
};

const UserPopover: React.FC<Props> = ({ userId }) => {
  const { room } = useRoom();

  return (
    <Popover
      width={300}
      position="bottom"
      shadow="md"
    >
      <Popover.Target>
        <ActionIcon>
          <Indicator inline label={(room?.users || []).length} size={16}>
            <FontAwesomeIcon 
              icon={faUser}
              style={{ 
                fontSize:'22px',
              }} 
            />
          </Indicator>
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        sx={{
          borderRadius: 12,
          backgroundColor: '#2f2f3d',
          border: 'none',
          padding: '15px',
        }}
      >
        <UserList userId={userId} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default UserPopover;