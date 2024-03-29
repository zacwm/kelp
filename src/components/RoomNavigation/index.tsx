/* eslint-disable array-element-newline */
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

import TestingPopover from './Popovers/Testing';
import RoomsPopover from './Popovers/Users';
import ControllerPopover from './Popovers/Controller';

type Props = {
  search: any;
  searchDispatch: React.Dispatch<any>;
  loadingTitles: boolean;
  onTorrentStart: (torrent: string) => void;
  setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
}

const RoomNavigation: React.FC<Props> = ({
  search,
  searchDispatch,
  loadingTitles,
  onTorrentStart,
  setSelectedTitle,
}) => {
  const [inputKeywords, setInputKeywords] = React.useState('');
  const [isTorrentLink, setIsTorrentLink] = React.useState(false);

  React.useEffect(() => {
    if (inputKeywords.startsWith('magnet:')) {
      setIsTorrentLink(true);
    } else {
      setIsTorrentLink(false);
    }
  }, [inputKeywords]);

  const titleCategories = [
    { label: 'Movies', value: 'movies' }, { label: 'TV Shows', value: 'shows' },
  ];

  const doSearch = () => {
    if (isTorrentLink) return onTorrentStart(inputKeywords);
    searchDispatch({ type: 'keywords', value: inputKeywords });
  };

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
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              searchDispatch({ type: 'reset' });
              setSelectedTitle(null);
            }}
          />
        </Box>
        {titleCategories.map((category, index) => (
          <Text
            key={index}
            onClick={() => {
              if (loadingTitles) return;
              searchDispatch({ type: 'category', value: category.value });
            }}
            weight={search.category === category.value ? 700 : 400}
            sx={{
              display: 'block',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              marginRight: 30,
              '&:hover': {
                color: '#bfbfbf',
              },
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
          <Text 
            color="kelpPalette.5" 
            sx={{
              marginRight: 15,
              userSelect: 'none',
              cursor: 'default',
            }}
          >
            Genre
          </Text>
          <Select
            value={search.genre}
            onChange={(genre: any) => {
              searchDispatch({ type: 'genre', value: genre });
            }}
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
              marginRight: 15,
              userSelect: 'none',
              cursor: 'default',
            }}
          >
            Sort by
          </Text>
          <Select
            value={search.sort}
            onChange={(sort: string) => {
              searchDispatch({ type: 'sort', value: sort });
            }}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') return doSearch();
            }}
            disabled={loadingTitles}
            placeholder="Search or Torrent/Magnet"
            styles={{
              root: {
                width: 400,
                '@media (max-width: 1600px)': {
                  width: 300,
                },
                '@media (max-width: 1500px)': {
                  width: 200,
                },
                '@media (max-width: 1400px)': {
                  display: 'none',
                },
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
              cursor: 'pointer',
            }}
            onClick={doSearch}
          >
            { isTorrentLink ? <img src="/DownloadIcon.svg" /> : <img src="/SearchIcon.svg" /> }
          </Box>
        </Group>
        <TestingPopover />
        <ControllerPopover />
        <RoomsPopover />
      </Group>
    </Group>
  );
};

export default RoomNavigation;