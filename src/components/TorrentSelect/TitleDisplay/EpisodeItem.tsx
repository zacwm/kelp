import * as React from 'react';

import { Box, Text, Group, Stack } from '@mantine/core';
import DownloadButton from './DownloadButton';

type Props = {
  episodeData: any,
  onSelect: (data: any) => void,
}

const EpisodeItem: React.FC<Props> = ({ episodeData, onSelect }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        padding: '7.5px 0',
        boxSizing: 'border-box',
        '&:first-of-type': {
          padding: '0 0 7.5px 0',
        },
      }}
    >
      <Group>
        <Text size="lg">{episodeData.episode}.</Text>
        <Stack sx={{ flex: 1 }}>
          <Text>{episodeData.title}</Text>
        </Stack>
        <DownloadButton
          torrents={episodeData.torrents}
          forceLang="en"
          onTorrentSelect={onSelect}
        />
      </Group>
    </Box>
  );
};

export default EpisodeItem;