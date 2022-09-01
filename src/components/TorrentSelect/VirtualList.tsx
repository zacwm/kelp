import React, { useState, useRef, useMemo, useEffect } from 'react';
import { VirtuosoGrid, GridComponents, GridItemContent } from 'react-virtuoso';
import { Box, Loader, createStyles, LoadingOverlay } from '@mantine/core';

import MemoizedTorrent from './TorrentCell';

interface Props {
  titleCategory: string,
  itemData: object[];
  isLoading: boolean;
  setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
  fetchTorrentList: (page: number, concat: boolean, forceLoad: boolean, callback?: () => void) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = createStyles((theme) => ({
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  itemContainer: {
    width: '200px',
    display: 'flex',
    flex: 'none',
    alignContent: 'stretch',
    boxSizing: 'border-box',
    [`@media (max-width: ${theme.breakpoints.lg}px)`]: {
      width: '33%',
    },
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      width: '50%',
    },
  },
}));

const VirtualList = ({
  titleCategory,
  itemData,
  isLoading,
  setSelectedTitle,
  fetchTorrentList
}: Props): React.ReactElement => {
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
    fetchTorrentList(lastPage.current, true, false, () => {
      setShallowFetch(false);
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
      Item: ItemContainer
    };
  }, [itemData, isLoading]);

  if (isLoading) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
        overscan={250}
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
