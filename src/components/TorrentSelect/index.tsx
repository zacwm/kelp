import * as React from 'react';
import type { Socket } from 'socket.io-client';
import { useDebouncedValue } from '@mantine/hooks';

import { useRoom } from '../../contexts/room.context';

import MovieDisplay from './MovieDisplay';
import ShowDisplay from './ShowDisplay';
import CustomTorrentPrompt from './CustomTorrentPrompt';
import VirtualList from './VirtualList';

import { 
  Box,
  Text, 
  Select, 
  Paper, 
  Stack, 
  Group,
  Image, 
  Loader, 
  TextInput, 
  Transition 
} from '@mantine/core';

type Props = {
  socket: Socket;
}

const TorrentSelect: React.FC<Props> = ({ socket }) => {
  const { room } = useRoom();

  const [titleCategory, setTitleCategory] = React.useState('movies');

  const [inputKeywords, setInputKeywords] = React.useState('');
  const [debouncedKeywords] = useDebouncedValue(inputKeywords, 1000);

  const [openCustomTorrentPrompt, setOpenCustomTorrentPrompt] = React.useState<boolean>(false);
  const [loadingTitles, setLoadingTitles] = React.useState<boolean>(true);
  const [torrentList, setTorrentList] = React.useState<object[]>([]);
  const [selectedTitle, setSelectedTitle] = React.useState<any>(null);
  
  React.useEffect(() => {
    loadTorrentList(1, false, true);
  }, [titleCategory, debouncedKeywords]);

  const loadTorrentList = async (
    page: number,
    concat: boolean,
    forceLoad: boolean,
    callback?: () => void,
  ): Promise<void> => {
    if (forceLoad) {
      setLoadingTitles(true);
    }

    console.dir(page);

    socket.emit('getTitles', {
      page: page || 1,
      category: titleCategory,
      keywords: debouncedKeywords
    }, (response: any) => {
      setLoadingTitles(false);

      if (typeof callback === 'function') {
        callback();
      }

      if (response.error) {
        setTorrentList([]);
        console.error(response.error);
        return;
      }

      if (concat) {
        const newTorrentList = [...torrentList, ...response.titles];
        setTorrentList(newTorrentList);
      } else {
        setTorrentList(response.titles || []); 
      }
    });
  };

  const onTorrentStart = (torrentURL: string) => {
    if (!socket) return;
    if (!room) return;
    if (!torrentURL) return;
    socket.emit('roomStartTorrent', {
      id: room.id,
      url: torrentURL,
    }, (res) => {
      if (res.error) alert(res.error);
      close();
    });
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setInputKeywords(value);
  };

  return (
    <Paper
      shadow="md"
      radius="sm"
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgba(26, 27, 30)',
        overflow: 'hidden',
      }}
    >
      <Transition
        mounted={openCustomTorrentPrompt}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <CustomTorrentPrompt
            styles={styles}
            setTorrent={(url) => onTorrentStart(url)}
            close={() => setOpenCustomTorrentPrompt(false)}
          />
        )}
      </Transition>
      <Transition
        mounted={selectedTitle && titleCategory == 'movies'}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <MovieDisplay
            styles={styles}
            title={titleCategory == 'movies' && selectedTitle}
            onTitleSelect={(url) => onTorrentStart(url)}
            close={() => setSelectedTitle(null)}
          />
        )}
      </Transition>
      <Transition
        mounted={selectedTitle && titleCategory == 'shows'}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <ShowDisplay
            styles={styles}
            title={titleCategory == 'shows' && selectedTitle}
            onTitleSelect={(url) => onTorrentStart(url)}
            close={() => setSelectedTitle(null)}
            socket={socket}
          />
        )}
      </Transition>
      <Stack sx={{ height: '100%' }} spacing={0}>
        <Group
          position="apart"
          sx={{
            width: '100%',
            padding: '20px 12px 20px 12px'
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
              onChange={onSearchChange}
              disabled={loadingTitles}
              placeholder="Search"
              sx={{ width: '400px' }}
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
        <VirtualList 
          titleCategory={titleCategory}
          itemData={torrentList}
          isLoading={loadingTitles}
          setSelectedTitle={setSelectedTitle}
          fetchTorrentList={loadTorrentList}
        />
      </Stack>
    </Paper>
  );
};

export default TorrentSelect;
