import * as React from 'react';
import type { Socket } from 'socket.io-client';

import { useRoom } from '../../contexts/room.context';

import MovieDisplay from './MovieDisplay';
import ShowDisplay from './ShowDisplay';
import CustomTorrentPrompt from './CustomTorrentPrompt';
import VirtualList from './VirtualList';

import { 
  Paper,
  Transition 
} from '@mantine/core';

type Props = {
  socket: Socket;
  titleCategory: string;
  searchKeywords: string;
  loadingTitles: boolean;
  setLoadingTitles: React.Dispatch<React.SetStateAction<boolean>>;
  selectGenre: string | null;
  selectSort: string | null;
}

const TorrentSelect: React.FC<Props> = ({
  socket,
  titleCategory,
  searchKeywords,
  loadingTitles,
  setLoadingTitles,
  selectGenre,
  selectSort,
}) => {
  const { room } = useRoom();

  const [openCustomTorrentPrompt, setOpenCustomTorrentPrompt] = React.useState<boolean>(false);
  const [torrentList, setTorrentList] = React.useState<object[]>([]);
  const [selectedTitle, setSelectedTitle] = React.useState<any>(null);
  
  React.useEffect(() => {
    loadTorrentList(1, false, true);
  }, [titleCategory, searchKeywords, selectGenre, selectSort]);

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
      keywords: searchKeywords,
      genre: selectGenre,
      sort: selectSort,
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

  return (
    <Paper
      shadow="md"
      sx={{
        position: 'relative',
        height: '100%',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box',
        background: '#191921',
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
      <VirtualList
        titleCategory={titleCategory}
        itemData={torrentList}
        isLoading={loadingTitles}
        setSelectedTitle={setSelectedTitle}
        fetchTorrentList={loadTorrentList}
      />
    </Paper>
  );
};

export default TorrentSelect;
