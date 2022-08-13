import * as React from 'react';

import { TextInput, Button, Stack, Group, Text } from '@mantine/core';

type Props = {
  setTorrent: (url: string) => void,
  close: () => void,
}

const CustomTorrentPrompt: React.FC<Props> = ({ setTorrent, close }) => {
  const [inputTorrentUrl, setInputTorrentUrl] = React.useState<string>('');

  return (
    <Stack sx={{
      height: '100%',
      width: '100%',
      padding: '16px 32px',
    }}>
      <Group position="right">
        <Button
          color="red"
          onClick={close}
        >
          Close
        </Button>
      </Group>
      <Stack
        align="center"
        justify="center"
        sx={{
          height: '100%',
          width: '100%',
          padding: '16px 32px',
          flex: 1,
        }}
      >
        <Text
          size={28}
        >
            Enter a custom torrent URI
        </Text>
        <TextInput
          size="sm"
          value={inputTorrentUrl}
          onChange={(val) => setInputTorrentUrl(val.currentTarget.value)}
          sx={{
            width: '100%',
          }}
        />
        <Group>
          <Button
            size="lg"
            onClick={() => setTorrent(inputTorrentUrl)}
          >
            Start Download
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
};

export default CustomTorrentPrompt;