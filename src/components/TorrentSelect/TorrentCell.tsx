import React, { useState } from 'react';

import { Box, Text, Paper, Group, Loader, Image, Stack, Center } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
interface Props {
  title: any;
  delayIndex: number;
  onSelect(): void;
}

interface ImageProps {
  src: string;
  alt: string;
}

const PosterImage = React.memo(function PosterImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true);
  const [hasError, setError] = useState(!props.src);

  const onLoad = () => {
    setLoading(false);
  };

  const onError = () => {
    setError(true);
    setLoading(false);
  };

  if (hasError) {
    return (
      <Paper
        sx={{
          width: 170,
          height: 250,
        }}
      >
        <Text>Failed to load image poster</Text>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: 170,
        height: 250,
      }}
    >
      {
        isLoading && (
          <Paper
            sx={{
              width: 170,
              height: 250,
            }}
          >
            <Center sx={{ height: 250 }}>
              <Loader size="lg" />
            </Center>
          </Paper>
        )
      }
      <Image 
        src={props.src}
        alt={props.alt}
        onLoad={onLoad}
        onError={onError}
        width={170}
        height={250}
        fit="cover"
        radius={12}
      /> 
    </Box>
  );
});

const Torrent = (props: Props) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 295,
        margin: '30px 15px 0 15px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        }
      }}
      title={props.title.title}
    >
      <Stack
        sx={{
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
          overflow: 'hidden',
          height: '100%',
          width: '100%',
        }}
        onClick={props.onSelect}
        spacing={1}
      >
        <PosterImage 
          src={props.title.images?.poster} 
          alt={props.title.title}
        />
        <Stack
          sx={{
            width: '100%',
            paddingTop: 6,
          }}
          spacing={1}
        >
          <Text
            weight={600}
            style={{
              width: 170,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            size="sm"
            color="#fff"
          >
            { props.title.title }
          </Text>
          <Group position="apart">
            <Text size={12}>{ props.title.year }</Text>
            <Group spacing={3}>
              <FontAwesomeIcon 
                icon={faStar} 
                style={{ 
                  fontSize:'12px', 
                  color: '#3bd4ae', 
                }} 
              />
              <Text color="kelpPalette.4" size={12}>{ props.title.rating.percentage/10 }</Text>
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};


const MemoizedTorrent = React.memo(Torrent, (prevProps: Props, nextProps: Props) => {
  return prevProps.title === nextProps.title && prevProps.delayIndex === nextProps.delayIndex;
});

export default MemoizedTorrent;
