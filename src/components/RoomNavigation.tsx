import * as React from 'react';

import {
  Group,
  Box,
  Image,
  Text,
  Select,
  TextInput,
  Loader,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

type Props = {
  loadingTitles: boolean;
  titleCategory: string;
  setTitleCategory: React.Dispatch<React.SetStateAction<string>>;
  setSearchKeywords: (e: string) => void;
}

const RoomNavigation: React.FC<Props> = ({ loadingTitles, titleCategory, setTitleCategory, setSearchKeywords }) => {

  const [inputKeywords, setInputKeywords] = React.useState('');
  const [debouncedKeywords] = useDebouncedValue(inputKeywords, 1000);

  React.useEffect(() => {
    setSearchKeywords(debouncedKeywords);
  }, [debouncedKeywords]);

  return (
    <Group
      position="apart"
      sx={{
        width: '100%',
        color: 'white',
      }}
    >
      <Group>
        <Box>
          <Image 
            src='/kelp-gradient-text.svg'
            height={40}
            fit='contain'
            sx={{
              display: 'inline-block',
            }}
          />
        </Box>
        {['Movies', 'Shows'].map((type, index) => (
          <Text
            key={index}
            onClick={() => {
              if (loadingTitles) return;
              setTitleCategory(type.toLowerCase());
            }}
            weight={titleCategory === type.toLowerCase() ? 700 : 400}
          >
            { type }
          </Text>
        ))}
        <Text>Genre</Text>
        <Select
          defaultValue="All"
          data={[
            { value: 'all', label: 'All' },
            { value: 'horror', label: 'Horror' },
          ]}
        />
        <Text>Sort By</Text>
        <Select
          defaultValue="Trending"
          data={[
            { value: 'trending', label: 'Trending' },
            { value: 'recent', label: 'Recent' },
          ]}
        />
      </Group>
      <Group>
        <TextInput
          value={inputKeywords}
          onChange={(e) => {
            setInputKeywords(e.target.value);
          }}
          disabled={loadingTitles}
          placeholder="Search"
          sx={{
            width: '400px',
          }}
          styles={{
            input: {
              borderRadius: '12px 0 0 12px',
            }
          }}
          variant="filled"
        />
        { loadingTitles && <Loader size="sm" /> }
        {/* <Button
          variant="filled"
          color={openCustomTorrentPrompt && 'red'}
          onClick={() => setOpenCustomTorrentPrompt(!openCustomTorrentPrompt)}
        >
          { !openCustomTorrentPrompt ? 'Enter Torrent/Magnet URI' : 'Close' }
        </Button> */}
      </Group>
    </Group>
  );
};

export default RoomNavigation;