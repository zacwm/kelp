import * as React from 'react';

import { Box, Stack, Text, Group, ActionIcon, Progress } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';

interface fileData {
  name: string;
  progress: number;
  ready: boolean;
  selected: boolean;
  onSelect: () => void;
}

const FileItem: React.FC<fileData> = ({
  name,
  progress,
  ready,
  selected,
  onSelect,
}) => {
  return (
    <Box
      sx={{
        padding: '10px',
        borderRadius: 12,
        '&:hover': {
          backgroundColor: '#3f3f4d',
        },
      }}
    >
      <Group noWrap>
        <Stack
          spacing={4}
          sx={{
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Text
            sx={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            { name }
          </Text>
          {
            (!ready && !selected) ? (
              <Progress
                value={progress}
                sx={{ width: '100%' }}
                size={5}
              />
            ) : null
          }
        </Stack>
        {
          ready && !selected ? (
            <ActionIcon
              onClick={onSelect}
            >
              <FontAwesomeIcon 
                icon={faPlayCircle}
                style={{ 
                  fontSize:'22px',
                }}
              />
            </ActionIcon>
          ) : null
        }
      </Group>
    </Box>
  );
};

export default FileItem;