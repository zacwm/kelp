import * as React from 'react';
import type { Socket } from 'socket.io-client';
import { useDebouncedValue } from '@mantine/hooks';

import { useRoom } from '../../contexts/room.context';

import MovieDisplay from './MovieDisplay';
import ShowDisplay from './ShowDisplay';
import CustomTorrentPrompt from './CustomTorrentPrompt';
import VirtualList from './VirtualList';

import { Box, Button, Paper, Text, Stack, Group, Loader, TextInput } from '@mantine/core';

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
        height: 'calc(100% - 100px)',
        width: 'calc(100% - 60px)',
        maxWidth: 1400,
        boxSizing: 'border-box',
        background: 'rgba(26, 27, 30)',
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ height: '100%' }} spacing={0}>
        { openCustomTorrentPrompt ? (
          <CustomTorrentPrompt
            setTorrent={(url) => onTorrentStart(url)}
            close={() => setOpenCustomTorrentPrompt(false)}
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
                padding: '12px 12px 0 12px'
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
              <TextInput
                value={inputKeywords}
                onChange={onSearchChange}
                disabled={loadingTitles}
                placeholder="Search"
                sx={{ width: '500px' }}
                variant="filled"
              />
              <Group>
                { loadingTitles && <Loader size="sm" /> }
                <Button
                  variant="filled"
                  color={openCustomTorrentPrompt && 'red'}
                  onClick={() => setOpenCustomTorrentPrompt(!openCustomTorrentPrompt)}
                >
                  { !openCustomTorrentPrompt ? 'Enter Torrent/Magnet URI' : 'Close' }
                </Button>
              </Group>
            </Group>
            <VirtualList 
              itemData={torrentList}
              isLoading={loadingTitles}
              setSelectedTitle={setSelectedTitle}
              fetchTorrentList={loadTorrentList}
            />
          </React.Fragment>
        ) }
      </Stack>
    </Paper>
  );
};

export default TorrentSelect;
