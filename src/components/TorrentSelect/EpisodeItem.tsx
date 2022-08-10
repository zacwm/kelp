import * as React from 'react';

import { Box, Text, Group, Button, Stack } from '@mantine/core';

type Props = {
  episodeData: any,
  onSelect: (url: string) => void,
}

const EpisodeItem: React.FC<Props> = ({ episodeData, onSelect }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        padding: '8px 16px',
        boxSizing: 'border-box',
      }}
    >
      <Group>
        <Text size="lg">{episodeData.episode}.</Text>
        <Stack sx={{ flex: 1 }}>
          <Text>{episodeData.title}</Text>
        </Stack>
        <Button
          onClick={() => {
            if (episodeData.torrents['1080p']?.url) {
              onSelect(episodeData.torrents['1080p'].url);
            } else {
              const firstQuality = Object.keys(episodeData.torrents)[0];
              onSelect(episodeData.torrents[firstQuality].url);
            }
          }}
        >
          Watch
        </Button>
      </Group>
    </Box>
  );
};

export default EpisodeItem;