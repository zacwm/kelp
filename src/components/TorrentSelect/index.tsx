import * as React from 'react';

import { useSocket } from 'contexts/socket.context';

import TitleDisplay from './TitleDisplay';
import VirtualList from './VirtualList';

import { 
  Paper,
  Transition 
} from '@mantine/core';

type Props = {
  search: any;
  searchDispatch: React.Dispatch<any>;
  loadingTitles: boolean;
  setLoadingTitles: React.Dispatch<React.SetStateAction<boolean>>;
  onTorrentStart: (torrent: string) => void;
  selectedTitle: any;
  setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
}

const TorrentSelect: React.FC<Props> = ({
  search,
  searchDispatch,
  loadingTitles,
  setLoadingTitles,
  onTorrentStart,
  selectedTitle,
  setSelectedTitle,
}) => {
  const { socket } = useSocket();

  const [torrentList, setTorrentList] = React.useState<object[]>([]);
  
  React.useEffect(() => {
    loadTorrentList(1, false, true);
  }, [search]);

  React.useEffect(() => {
    setSelectedTitle(null);
  }, [loadingTitles]);

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
      category: search.category,
      keywords: search.keywords,
      genre: search.genre,
      sort: search.sort,
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
        mounted={selectedTitle}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <TitleDisplay
            styles={styles}
            title={selectedTitle}
            type={search.category}
            onTitleSelect={(url) => onTorrentStart(url)}
            setGenre={(genre) => searchDispatch({ type: 'genre', value: genre })}
            close={() => setSelectedTitle(null)}
          />
        )}
      </Transition>
      <VirtualList
        titleCategory={search.category}
        itemData={torrentList}
        isLoading={loadingTitles}
        setSelectedTitle={setSelectedTitle}
        fetchTorrentList={loadTorrentList}
      />
    </Paper>
  );
};

export default TorrentSelect;
