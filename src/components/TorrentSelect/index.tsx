import * as React from 'react';

import { useSocket } from '../../contexts/socket.context';

import TitleDisplay from './TitleDisplay';
import VirtualList from './VirtualList';

import { 
  Paper,
  Transition 
} from '@mantine/core';

type Props = {
  titleCategory: string;
  searchKeywords: string;
  loadingTitles: boolean;
  setLoadingTitles: React.Dispatch<React.SetStateAction<boolean>>;
  selectGenre: string | null;
  setSelectGenre: React.Dispatch<React.SetStateAction<string | null>>;
  selectSort: string | null;
  onTorrentStart: (torrent: string) => void;
  selectedTitle: any;
  setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
}

const TorrentSelect: React.FC<Props> = ({
  titleCategory,
  searchKeywords,
  loadingTitles,
  setLoadingTitles,
  selectGenre,
  setSelectGenre,
  selectSort,
  onTorrentStart,
  selectedTitle,
  setSelectedTitle,
}) => {
  const { socket } = useSocket();
  
  const [torrentList, setTorrentList] = React.useState<object[]>([]);
  
  React.useEffect(() => {
    loadTorrentList(1, false, true);
  }, [titleCategory, searchKeywords, selectGenre, selectSort]);

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
            type={titleCategory}
            onTitleSelect={(url) => onTorrentStart(url)}
            setGenre={setSelectGenre}
            close={() => setSelectedTitle(null)}
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
