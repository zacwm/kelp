import * as React from 'react';
import type { Socket } from 'socket.io-client';

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import TestingPopover from './Popovers/Testing';
import RoomsPopover from './Popovers/Users';

type Props = {
  socket: Socket;
  loadingTitles: boolean;
  titleCategory: string;
  setTitleCategory: React.Dispatch<React.SetStateAction<string>>;
  setSearchKeywords: (e: string) => void;
  selectGenre: string | null;
  setSelectGenre: React.Dispatch<React.SetStateAction<string | null>>;
  selectSort: string | null;
  setSelectSort: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string;
}

const RoomNavigation: React.FC<Props> = ({
  socket,
  loadingTitles,
  titleCategory,
  setTitleCategory,
  setSearchKeywords,
  selectGenre,
  setSelectGenre,
  selectSort,
  setSelectSort,
  userId,
}) => {

  const [inputKeywords, setInputKeywords] = React.useState('');
  const [debouncedKeywords] = useDebouncedValue(inputKeywords, 1000);

  React.useEffect(() => {
    setSearchKeywords(debouncedKeywords);
  }, [debouncedKeywords]);

  const titleCategories = [
    { label: 'Movies', value: 'movies' },
    { label: 'TV Shows', value: 'shows' },
  ];

  return (
    <Group
      position="apart"
      sx={{
        width: '100%',
        color: 'white',
      }}
    >
      <Group spacing={0}>
        <Box sx={{ marginRight: 60 }}>
          <Image 
            src='/kelp-gradient-text.svg'
            height={40}
            fit='contain'
            sx={{
              display: 'inline-block',
            }}
          />
        </Box>
        {titleCategories.map((category, index) => (
          <Text
            key={index}
            onClick={() => {
              if (loadingTitles) return;
              setTitleCategory(category.value);
            }}
            weight={titleCategory === category.value ? 700 : 400}
            sx={{
              display: 'block',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              marginRight: 30,
              '&:hover': {
                color: '#98989a',
              }
            }}
          >
            { category.label }
          </Text>
        ))}
        <Group
          sx={{
            marginLeft: 30,
          }}
          spacing={0}
        >
          <Text color="kelpPalette.5" sx={{ marginRight: 15 }}>Genre</Text>
          <Select
            value={selectGenre}
            onChange={setSelectGenre}
            data={[
              { value: '', label: 'All'  },
              { value: 'action', label: 'Action' },
              { value: 'adventure', label: 'Adventure' },
              { value: 'animation', label: 'Animation' },
              { value: 'comedy', label: 'Comedy' },
              { value: 'crime', label: 'Crime' },
              { value: 'documentary', label: 'Documentary' },
              { value: 'drama', label: 'Drama' },
              { value: 'family', label: 'Family' },
              { value: 'fantasy', label: 'Fantasy' },
              { value: 'history', label: 'History' },
              { value: 'horror', label: 'Horror' },
              { value: 'music', label: 'Music' },
              { value: 'mystery', label: 'Mystery' },
              { value: 'romance', label: 'Romance' },
              { value: 'science-fiction', label: 'Science-Fiction' },
              { value: 'sports', label: 'Sports' },
              { value: 'thriller', label: 'Thriller' },
              { value: 'war', label: 'War' },
              { value: 'western', label: 'Western' },
            ]}
          />
          <Text
            color="kelpPalette.5"
            sx={{
              marginLeft: 30,
              marginRight: 15
            }}
          >
            Sort by
          </Text>
          <Select
            value={selectSort}
            onChange={setSelectSort}
            data={[
              { value: 'trending', label: 'Trending' },
              { value: 'rating', label: 'Rating' },
              { value: 'year', label: 'Year' },
            ]}
          />
        </Group>
      </Group>
      <Group>
        { loadingTitles && <Loader size="sm" /> }
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
          <FontAwesomeIcon 
            icon={faMagnifyingGlass}
            style={{
              display: 'block',
              backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%);',
              borderRadius: '0 12px 12px 0',
              height: '20px',
              width: '20px',
              marginLeft: '-18px',
              padding: '8px',
            } }
          />
        </Group>
        
        <TestingPopover socket={socket} />
        <RoomsPopover socket={socket} userId={userId} />
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