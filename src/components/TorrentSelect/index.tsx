import * as React from 'react';
import type { Socket } from 'socket.io-client';
import { useDebouncedValue } from '@mantine/hooks';

import { useRoom } from '../../contexts/room.context';

import TitleItem from './TitleItem';
import MovieDisplay from './MovieDisplay';
import ShowDisplay from './ShowDisplay';
import CustomTorrentPrompt from './CustomTorrentPrompt';

import { Box, Button, Paper, Text, Stack, Group, NumberInput, Loader, TextInput, ScrollArea } from '@mantine/core';
import InfinateScroll from './InfinateScroll';

type Props = {
  socket: Socket;
}

const TorrentSelect: React.FC<Props> = ({ socket }) => {
  const { room } = useRoom();

  const [titleCategory, setTitleCategory] = React.useState('movies');

  // TODO: Move to infinite scroll
  const [inputPageNumber, setInputPageNumber] = React.useState(1);
  const [debouncedPageNumber] = useDebouncedValue(inputPageNumber, 1000);

  const [inputKeywords, setInputKeywords] = React.useState('');
  const [debouncedKeywords] = useDebouncedValue(inputKeywords, 1000);

  const [openCustomTorrentPrompt, setOpenCustomTorrentPrompt] = React.useState<boolean>(false);

  const [loadingTitles, setLoadingTitles] = React.useState<boolean>(true);
  // const [titles, setTitles] = React.useState(() => []);
  const [titles, setTitles] = React.useState([]);
  const [selectedTitle, setSelectedTitle] = React.useState<any>(null);
  
  const getTitles = async (page?: number) => {
    setLoadingTitles(true);
    socket.emit('getTitles', { page: page || 1, category: titleCategory, keywords: inputKeywords }, (response) => {
      setLoadingTitles(false);
      if (response.error) {
        setTitles([]);
        console.error(response.error);
        return;
      }

      setTitles(response.titles || []);
    });
  };

  React.useEffect(() => {
    getTitles();
  }, [titleCategory]);

  React.useEffect(() => {
    setInputPageNumber(1);
    getTitles();
  }, [debouncedKeywords]);

  React.useEffect(() => {
    if (!debouncedPageNumber) return;
    getTitles(debouncedPageNumber);
  }, [debouncedPageNumber]);

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

  return (
    <Paper
      shadow="md"
      radius="sm"
      sx={{
        height: 'calc(100% - 60px)',
        width: 'calc(100% - 60px)',
        boxSizing: 'border-box',
        background: 'rgba(26, 27, 30)',
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ height: '100%' }} spacing={0}>
        { !selectedTitle && (
          <Group position="apart" align="center" sx={{ padding: '8px 16px' }}>
            <Text
              size={40}
              color="green"
              weight={600}
            >
              Select a torrent
            </Text>
            <Button
              variant="filled"
              color={openCustomTorrentPrompt && 'red'}
              onClick={() => setOpenCustomTorrentPrompt(!openCustomTorrentPrompt)}
            >
              { !openCustomTorrentPrompt ? 'Enter Torrent/Magnet URI' : 'Close' }
            </Button>
          </Group>
        )}
        { openCustomTorrentPrompt ? (
          <CustomTorrentPrompt
            setTorrent={(url) => onTorrentStart(url)}
          />
        ) : selectedTitle ? (
          titleCategory == 'movies' ? (
            <MovieDisplay
              title={selectedTitle}
              onTitleSelect={(url) => onTorrentStart(url)}
              close={() => setSelectedTitle(null)}
            />
          ) : (
            <ShowDisplay
              title={selectedTitle}
              onTitleSelect={(url) => onTorrentStart(url)}
              close={() => setSelectedTitle(null)}
              socket={socket}
            />
          )
        ) : (
          <React.Fragment>
            <Group
              position="apart"
              sx={{
                width: '100%',
                borderBottom: 'solid 1px #2C2E33',
                padding: '0px 12px'
              }}
            >
              <Group>
                {['Movies', 'Shows'].map((type, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: '100%',
                      padding: '6px 12px',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      color: '#fff',
                      background: type.toLowerCase() == titleCategory ? '#2f9e44' : '#2C2E33',
                    }}
                    onClick={() => {
                      if (loadingTitles) return;
                      setTitleCategory(type.toLowerCase());
                    }}
                  >
                    { type }
                  </Box>
                ))}
              </Group>
              <Group>
                { loadingTitles && <Loader size="sm" /> }
                <Text>Search</Text>
                <TextInput
                  value={inputKeywords}
                  onChange={(event) => setInputKeywords(event.currentTarget.value)}
                  disabled={loadingTitles}
                  sx={{ width: '200px' }}
                  variant="filled"
                />
                <Text>Page</Text>
                <NumberInput
                  value={inputPageNumber}
                  onChange={setInputPageNumber}
                  disabled={loadingTitles}
                  sx={{ width: '100px' }}
                  variant="filled"
                />
              </Group>
            </Group>
            <InfinateScroll
              socket={socket}
              setSelectedTitle={setSelectedTitle}
              titleCategory={titleCategory}
              setLoadingTitles={setLoadingTitles}
              setTitles={setTitles}
              inputKeywords={inputKeywords}
            />
          </React.Fragment>
        ) }
      </Stack>
    </Paper>
  );
};

export default TorrentSelect;