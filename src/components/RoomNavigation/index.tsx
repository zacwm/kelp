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
      <Group spacing={30}>
        { loadingTitles && <Loader size="sm" /> }
        <Group spacing={0} sx={{ marginRight: 30 }}>
          <TextInput
            value={inputKeywords}
            onChange={(e) => {
              setInputKeywords(e.target.value);
            }}
            disabled={loadingTitles}
            placeholder="Search"
            styles={{
              root: {
                width: 400,
                '@media (max-width: 1600px)': {
                  width: 250,
                }
              },
              input: {
                backgroundColor: '#2f2f3d',
                color: '#fff',
                border: '1px solid #2f2f3d',
                borderRadius: '12px 0 0 12px',
          
                '&::placeholder': {
                  color: '#98989a',
                },
          
                '&:disabled': {
                  backgroundColor: '#191921',
                  color: '#2f2f3d',
                  border: '1px solid #191921',
                },
              },
            }}
            variant="filled"
          />
          <Box
            sx={{
              width: '36px',
              height: '36px',
              backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%)',
              padding: '7px 10px 10px 8px',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <img src="/SearchIcon.svg" />
          </Box>
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