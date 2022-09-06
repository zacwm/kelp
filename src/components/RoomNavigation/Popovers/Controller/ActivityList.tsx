import React from 'react';

import { Box, ScrollArea, Stack, Group, Text } from '@mantine/core';

const ActivityList: React.FC = () => {

  // Test log data
  const [logData, setLogData] = React.useState<any>([
    { name: 'Bill', value: 'pressed pause.' },
    { name: 'Alex', value: 'pressed play.' },
    { name: 'Alex', value: 'had enough.' },
    { name: 'Bill', value: 'found something to watch.' },
    { name: 'Bill', value: 'pressed play.' },
    { name: 'Bill', value: 'pressed pause.' },
    { name: 'Alex', value: 'pressed play.' },
    { name: 'Alex', value: 'had enough.' },
    { name: 'Bill', value: 'found something to watch.' },
    { name: 'Bill', value: 'pressed play.' },
    { name: 'Bill', value: 'pressed pause.' },
    { name: 'Alex', value: 'pressed play.' },
    { name: 'Alex', value: 'had enough.' },
    { name: 'Bill', value: 'found something to watch.' },
    { name: 'Bill', value: 'pressed play.' },
    { name: 'Bill', value: 'pressed pause.' },
    { name: 'Alex', value: 'pressed play.' },
    { name: 'Alex', value: 'had enough.' },
    { name: 'Bill', value: 'found something to watch.' },
    { name: 'Bill', value: 'pressed play.' },
    { name: 'Bill', value: 'pressed pause.' },
    { name: 'Alex', value: 'pressed play.' },
    { name: 'Alex', value: 'had enough.' },
    { name: 'Bill', value: 'found something to watch.' },
    { name: 'Bill', value: 'pressed play.' },
  ]);

  return (
    <ScrollArea
      sx={{
        width: '100%',
        height: '200px',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#191921',
      }}
    >
      <Stack
        sx={{
          gap: '10px',
          padding: '15px',
        }}
      >
        {logData.map((item: any, index: number) => (
          <Box key={index}>
            <Group
              spacing={4}
              sx={{
                fontSize: 14,
              }}
            >
              <Text weight={700}>{item.name}</Text>
              <Text>{item.value}</Text>
            </Group>
          </Box>
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default ActivityList;