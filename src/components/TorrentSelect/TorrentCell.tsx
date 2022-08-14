import React, { useEffect, useState } from 'react';

import { Box, Text, Paper, Group, Transition, Loader, Image, createStyles } from '@mantine/core';

interface Props {
    title: any;
    delayIndex: number;
    onSelect(): void;
}

interface ImageProps {
    src: string;
    alt: string;
}

const useClasses = createStyles((theme) => ({
  image: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.dark[8],
  },
  loading: {
    position: 'absolute',
    zIndex: 2,
  },
  error: {
    color: theme.colors.red[7],
  }
}));

const PosterImage = React.memo(function PosterImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true);
  const [hasError, setError] = useState(!props.src);

  const { cx, classes } = useClasses();

  const onLoad = () => {
    setLoading(false);
  };

  const onError = () => {
    setError(true);
    setLoading(false);
  };

  if (hasError) {
    return (
      <Paper className={cx(classes.image, classes.error)}>
        <Text>Failed to load image poster</Text>
      </Paper>
    );
  }

  return (
    <React.Fragment>
      {
        isLoading && (
          <Paper className={cx(classes.image, classes.loading)}
          >
            <Loader variant="bars" size="md"/>
          </Paper>
        )
      }
      <Image 
        src={props.src}
        alt={props.alt}
        onLoad={onLoad}
        onError={onError} 
      /> 
    </React.Fragment>
  );
});

const Torrent = (props: Props) => {
  // TODO: Add fade in effect with `mounted`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mounted, isMounted] = useState(false);

  let timeout = null;

  // I believe this causes a memory leak
  // be careful when using this
  useEffect(() => {
    timeout = setTimeout(() => {
      isMounted(true);
    }, props.delayIndex * 5);

    return () => {
      clearTimeout(timeout);
      isMounted(false);
    };
  }, [props.delayIndex]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '280px',
        margin: 12,
      }}
      title={props.title.title}
    >
      <Transition
        mounted
        duration={300}
        transition="fade"
      >
        {(styles) => (
          <Paper 
            shadow="md"
            radius="sm"
            sx={{
              position: 'relative',
              background: '#2C2E33',
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',
              '&:hover': {
                background: 'rgba(57, 59, 66)',
              },
              display: 'flex',
              flexDirection: 'column',
              height: '100% '
            }}
            onClick={props.onSelect}
            style={styles}
          >
            <Box sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <PosterImage 
                src={props.title.images?.poster} 
                alt={props.title.title}
              />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: 'fit-content',
                padding: '4px 6px',
                background: 'rgba(26, 27, 30, 0.85)'
              }}
            >
              <Text weight={600} style={{
                whiteSpace: 'pre-wrap',
              }}>{ props.title.title }</Text>
              <Group spacing="xs">
                <Text size={12}>{ props.title.year }</Text>
                <Text size={12}>{ props.title.certification }</Text>
              </Group>
            </Box>
          </Paper>
        )}
      </Transition>
    </Box>
  );
};


const MemoizedTorrent = React.memo(Torrent, (prevProps: Props, nextProps: Props) => {
  return prevProps.title === nextProps.title && prevProps.delayIndex === nextProps.delayIndex;
});

export default MemoizedTorrent;
