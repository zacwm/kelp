import React, { useState, useRef, useMemo, useEffect } from 'react';
import { VirtuosoGrid, GridComponents, GridItemContent } from 'react-virtuoso';

import { useSocket } from 'contexts/socket.context';

import { Box, Loader, createStyles, LoadingOverlay } from '@mantine/core';

import MemoizedTorrent from './TorrentCell';

interface Props {
  titleCategory: string,
  itemData: object[];
  isLoading: boolean;
  setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
  search: any;
  setLoadingTitles: React.Dispatch<React.SetStateAction<boolean>>;
  torrentList: any;
  setTorrentList: React.Dispatch<React.SetStateAction<any>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = createStyles((theme) => ({
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 5,
  },
  itemContainer: {
    width: '200px',
    height: '330px',
    display: 'flex',
    flex: 'none',
    alignContent: 'stretch',
    boxSizing: 'border-box',
  },
}));

const VirtualList = ({
  titleCategory,
  itemData,
  isLoading,
  setSelectedTitle,
  search,
  setLoadingTitles,
  torrentList,
  setTorrentList,
}: Props): React.ReactElement => {
  const { socket } = useSocket();
  const { classes } = useStyles();

  const [shallowFetch, setShallowFetch] = useState(false);

  const hasMoreData = () => {
    return itemData.length >= 50;
  };

  const lastPage = useRef(1);
  const hasMore = hasMoreData();

  useEffect(() => {
    lastPage.current = 1;
  }, [titleCategory]);

  const onEndReached = () => {
    if (shallowFetch || !hasMore) {
      return;
    }

    setShallowFetch(true);
    lastPage.current += 1;

    socket.emit('getTitles', {
      page: lastPage.current,
      category: search.category,
      keywords: search.keywords,
      genre: search.genre,
      sort: search.sort,
    }, (response: any) => {
      setShallowFetch(false);

      const newTorrentList = [...torrentList, ...response.titles];
      setTorrentList(newTorrentList);
    });
  };

  const itemContent: GridItemContent<number> = (index: number) => {
    const torrent = itemData[index];

    if (torrent) {
      return (
        <MemoizedTorrent 
          key={index}
          title={torrent}
          onSelect={() => setSelectedTitle(torrent)}
          delayIndex={index}
        />
      );
    } else {
      return <div style={{ height: 1 }}/>;
    }        
  };

  const Components: GridComponents = useMemo(() => {
    const List = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function List(props, ref) {
      return(
        <div {...props} ref={ref} className={classes.list}/>
      );
    });

    const ItemContainer = (props: any) => {
      return <div {...props} className={classes.itemContainer}/>;
    };

    return {
      List: List,
      Item: ItemContainer,
    };
  }, [itemData, isLoading]);

  if (isLoading) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <LoadingOverlay visible={shallowFetch} />
      <VirtuosoGrid
        style={{
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
        totalCount={itemData.length}
        overscan={360}
        components={Components}
        itemContent={itemContent}
        endReached={onEndReached}
      />
    </Box>
  );
};

const MemoizedVirtualList = React.memo(VirtualList, (prevProps: Props, nextProps: Props) => {
  return JSON.stringify(prevProps.itemData) === JSON.stringify(nextProps.itemData) && prevProps.isLoading === nextProps.isLoading;
});

export default MemoizedVirtualList;
