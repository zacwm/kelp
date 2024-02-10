import * as React from 'react';

import { useSocket } from 'contexts/socket.context';

import TitleDisplay from './TitleDisplay';
import VirtualList from './VirtualList';

import {
  Paper,
  Center,
  Text,
  Transition,
} from '@mantine/core';

type Props = {
  search: any;
  searchDispatch: React.Dispatch<any>;
  loadingTitles: boolean;
  setLoadingTitles: React.Dispatch<React.SetStateAction<boolean>>;
  onTorrentStart: (torrentData: any) => void;
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

  React.useEffect((): any => {
    // 'isSubscribed' is used to prevent overfetching when search reducer is changed during a search.
    let isSubscribed = true;

    setLoadingTitles(true);

    socket.emit('getTitles', {
      page: 1,
      category: search.category,
      keywords: search.keywords,
      genre: search.genre,
      sort: search.sort,
    }, (response: any) => {
      if (isSubscribed) {
        setLoadingTitles(false);

        setTorrentList(response.titles || []);
      }
    });

    return () => isSubscribed = false;
  }, [search]);

  React.useEffect(() => {
    setSelectedTitle(null);
  }, [loadingTitles]);


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
            onTitleSelect={(data) => onTorrentStart(data)}
            setGenre={(genre) => searchDispatch({ type: 'genre', value: genre })}
            close={() => setSelectedTitle(null)}
          />
        )}
      </Transition>
      {
        torrentList.length === 0 ? (
          <Center
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
            <Text
              sx={{
                'margin-top': '2vw',
                'text-align': 'center',
              }}
            >
              No results could be found or the API could not be reached..
            </Text>
          </Center>
        ) : (
          <VirtualList
            titleCategory={search.category}
            itemData={torrentList}
            isLoading={loadingTitles}
            setSelectedTitle={setSelectedTitle}
            search={search}
            setLoadingTitles={setLoadingTitles}
            torrentList={torrentList}
            setTorrentList={setTorrentList}
          />
        )
      }
    </Paper >
  );
};

export default TorrentSelect;
