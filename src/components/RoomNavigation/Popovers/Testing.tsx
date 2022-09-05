import * as React from 'react';

import { useSocket } from '../../../contexts/socket.context';
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

const TestingPopover: React.FC = () => {
  const { socket } = useSocket();
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
            style={{ 
              fontSize:'22px', 
            }}
          />
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
          <Text>Testing toolz</Text>
          <Select
            value={inputSelect.toString()}
            onChange={(value: string) => { 
              setInputSelect(parseInt(value));
            }}
            data={selectActionTypeOptions}
            styles={{
              input: {
                borderRadius: 12,
                backgroundColor: '#191921',
                border: 'none',
                color: '#3bd4ae',
                fontWeight: 700,
              },
              dropdown: {
                borderRadius: 12,
                backgroundColor: '#191921',
                border: 'none',
                color: '#98989a',
              },
              item: {
                borderRadius: 12,
                '&:hover': {
                  backgroundColor: '#2f2f3d',
                },
              },
            }}
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