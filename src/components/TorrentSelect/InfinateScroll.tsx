import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { CircularProgress, LinearProgress } from '@mui/material';
import { makeStyles } from '@material-ui/styles';
import InfiniteScroll from 'react-infinite-scroll-component';
import TitleItem from './TitleItem';
import { ScrollArea } from '@mantine/core';

const useStyles = makeStyles({
  itemCardsArea: {
    width: '100%'
  },

  progress: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginTop: '-100px',
    marginLeft: '-100px'
  }
});

type Props = {
  socket: any;
  setSelectedTitle: any;
  titleCategory: any;
  setLoadingTitles: any;
  setTitles: any;
  inputKeywords: any;
}

const InfinateScroll: React.FC<Props> = ({ socket, setSelectedTitle, titleCategory, setLoadingTitles, setTitles, inputKeywords }) => {
  const classes = useStyles();
  const [itemData, setItemData] = useState<any>();

  // Setting up states for InfiniteScroll
  const [scrollData, setScrollData] = useState<any>();
  const [hasMoreValue, setHasMoreValue] = useState(true);

  // When user is close enough to the bottom of the page, this function gonna be triggered
  // , new scrollData (data to be rendered) will be created
  const loadScrollData = async () => {
    try {
      setScrollData(itemData.slice(0, scrollData.length + 8));
    } catch (err) {
      console.log(err);
    }
  };

  // Handler function. Not only scrollData will be set up, but also hasMoreValue's value
  // Loader depends on it's value (show loader/ not show loader)
  const handleOnRowsScrollEnd = () => {
    if (scrollData.length < itemData.length) {
      setHasMoreValue(true);
      loadScrollData();
    } else {
      setHasMoreValue(false);
    }
  };

  const fetchMovieList = async (page?: number) => {
    setLoadingTitles(true);
    socket.emit('getTitles', { page: page || 1, category: titleCategory, keywords: inputKeywords }, (response) => {
      setLoadingTitles(false);
      if (response.error) {
        setTitles([]);
        console.error(response.error);
        return;
      }

      const newItemData = response.titles || [];
      setItemData(newItemData);
      setScrollData(newItemData.slice(0, 50));
    });
  };

  useEffect(() => {
    fetchMovieList();
  }, []);

  const renderCards = (index) => {
    const title = itemData[index];
    return (
      <TitleItem 
        key={index}
        title={title}
        onSelect={() => setSelectedTitle(title)}
        delayIndex={index * 150}
      />

    );
  };

  return (
    <ScrollArea
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        padding: '0 16px',
      }}
    >
      {scrollData ? (
        <InfiniteScroll
          dataLength={scrollData.length}
          next={handleOnRowsScrollEnd}
          hasMore={hasMoreValue}
          scrollThreshold={1}
          loader={<LinearProgress />}
          style={{ overflow: 'unset'}}
          // Let's get rid of second scroll bar
        > 
          <Grid container spacing={4} className={classes.itemCardsArea}>
            {scrollData.map((item, index) => renderCards(index))}
          </Grid>
        </InfiniteScroll>
      ) : (
        <CircularProgress
          color={'success'}
          className={classes.progress}
          size={200}
        />
      )}
    </ScrollArea>
  );
};

export default InfinateScroll;
