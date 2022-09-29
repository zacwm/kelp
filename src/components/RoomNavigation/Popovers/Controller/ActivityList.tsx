import React from 'react';

import { Box, ScrollArea, Stack, Group, Text } from '@mantine/core';

type props = {
  logData: any[];
}

const ActivityList: React.FC<props> = ({ logData }) => {
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