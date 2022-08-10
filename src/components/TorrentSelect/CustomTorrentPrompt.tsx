import * as React from 'react';

import { Box, TextInput, Button, Stack } from '@mantine/core';

type Props = {
  setTorrent: (url: string) => void,
}

const CustomTorrentPrompt: React.FC<Props> = ({ setTorrent }) => {
  const [inputTorrentUrl, setInputTorrentUrl] = React.useState<string>('');

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      padding: '8px 16px',
    }}>
      <Stack>
        <TextInput
          label="Torrent/Magnet URL"
          value={inputTorrentUrl}
          onChange={(val) => setInputTorrentUrl(val.currentTarget.value)}
        />
        <Button onClick={() => setTorrent(inputTorrentUrl)}>Start Download</Button>
      </Stack>
    </Box>
  );
};

export default CustomTorrentPrompt;