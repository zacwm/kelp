import * as React from 'react';
import type { Socket } from 'socket.io-client';

import { useRoom } from '../../../contexts/room.context';

import {
  Popover,
  ActionIcon,
  Text,
  Stack,
  Button,
  Select,
} from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToilet } from '@fortawesome/free-solid-svg-icons';

type Props = {
  socket: Socket;
};

const TestingPopover: React.FC<Props> = ({ socket }) => {
  const { room } = useRoom();

  const [inputSelect, setInputSelect] = React.useState<number>(0);

  const selectActionTypeOptions = [
    { value: '1', label: '[1] Reset room' },
    { value: '2', label: '[2] Convert test mkv' },
    { value: '3', label: '[3] Convert test mp4' },
    { value: '4', label: '[4] Convert test avi' },
    { value: '5', label: '[5] Convert test mov' },
  ];

  return (
    <Popover width={300} position="bottom" shadow="md">
      <Popover.Target>
        <ActionIcon>
          <FontAwesomeIcon 
            icon={faToilet}
          />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text>Testing toolz</Text>
          <Select
            value={inputSelect.toString()}
            onChange={(value: string) => { 
              setInputSelect(parseInt(value));
            }}
            data={selectActionTypeOptions}
          />
          <Button onClick={() => socket.emit('playerTest', room.id, inputSelect) }>
            Run action
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default TestingPopover;