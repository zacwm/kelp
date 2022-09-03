import * as React from 'react';

import { Box, Stack, Group, Text, Button, ActionIcon, Badge, AspectRatio } from '@mantine/core';

import { IconArrowLeft, IconExternalLink } from '@tabler/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faStar, faClock, faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import DownloadButton from './DownloadButton';

const FanartBanner: React.FC<any> = ({ imgSrc }) => {
  const srcSplit = imgSrc.split('/');
  const getImagesId = srcSplit[srcSplit.length - 1];
  const sourceUrl = `https://image.tmdb.org/t/p/w1920_and_h1080_multi_faces/${getImagesId}`;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), #191921, #191921), url(${sourceUrl});`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />
  );
};

type Props = {
  styles: any,
  title: any,
  onTitleSelect: (url: string) => void,
  setGenre: React.Dispatch<React.SetStateAction<string | null>>,
  close: () => void,
}

const TitleDisplay: React.FC<Props> = ({ styles, title, onTitleSelect, setGenre, close }) => {
  if (!title) return null;

  const formatTitleRuntime = () => {
    const minutes = parseInt(title.runtime);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <Box
      style={styles}
      sx={{
        position: 'absolute',
        background: '#191921',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 100,
      }}
    >
      <FanartBanner imgSrc={title?.images?.fanart} />
      <ActionIcon
        onClick={close}
        size="lg"
        sx={{
          position: 'absolute',
          top: 30,
          left: 30,
          zIndex: 100,
        }}
      >
        <IconArrowLeft size={30} />
      </ActionIcon>
      <Stack
        sx={{
          height: '100%',
          width: '100%',
          position: 'relative',
          boxSizing: 'border-box',
        }}
        spacing={0}
      >
        <Group
          sx={{
            position: 'relative',
            height: '100%',
          }}
          align="flex-start"
          spacing={0}
        >
          <Stack
            sx={{
              width: 320,
              position: 'relative',
              margin: '90px 60px 0 90px',
              boxSizing: 'border-box',
            }}
            spacing={0}
          >
            <img
              src={ title.images?.poster }
              alt={ title.title }
              width="100%"
              loading="lazy"
              style={{
                borderRadius: 12,
                marginBottom: 15,
              }}
            />
            <Stack spacing={20}>
              <Group spacing={15}>
                <Group spacing={10}>
                  <FontAwesomeIcon 
                    icon={faCalendar} 
                    style={{ 
                      color: '#98989a',
                      fontSize: 14,
                    }} 
                  />
                  <Text
                    sx={{
                      fontSize: 14,
                      color: '#98989a',
                    }}
                  >
                    { title.year }
                  </Text>
                </Group>

                <Group spacing={10}>
                  <FontAwesomeIcon 
                    icon={faCircleQuestion} 
                    style={{ 
                      color: '#98989a',
                      fontSize: 14,
                    }} 
                  />
                  <Text
                    sx={{
                      fontSize: 14,
                      color: '#98989a',
                    }}
                  >
                    { title.certification }
                  </Text>
                </Group>
                <Group spacing={10}>
                  <FontAwesomeIcon 
                    icon={faClock} 
                    style={{ 
                      color: '#98989a',
                      fontSize: 14,
                    }} 
                  />
                  <Text
                    sx={{
                      fontSize: 14,
                      color: '#98989a',
                    }}
                  >
                    { formatTitleRuntime() }
                  </Text>
                </Group>

                <Group spacing={10}>
                  <FontAwesomeIcon 
                    icon={faStar} 
                    style={{ 
                      color: '#98989a',
                      fontSize: 14,
                    }} 
                  />
                  <Text
                    sx={{
                      fontSize: 14,
                      color: '#98989a',
                    }}
                  >
                    { title.rating.percentage / 10 }
                  </Text>
                </Group>
              </Group>
              <Group spacing={10}>
                {(title.genres || []).map((genre, index) => <Badge
                  key={index}
                  onClick={() => {
                    setGenre(genre);
                    close();
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  { genre }
                </Badge>)}
              </Group>
              <Group>
                <Button
                  compact
                  leftIcon={<IconExternalLink />}
                  onClick={() => window.open(`https://www.imdb.com/title/${title['imdb_id']}`, '_blank', 'noopener,noreferrer')}
                  styles={{
                    root: {
                      backgroundImage: 'none',
                      color: '#3bd4ae',
                    }
                  }}
                >
                  IMDb
                </Button>
              </Group>
            </Stack>
          </Stack>
          <Stack
            sx={{
              height: '100%',
              overflowY: 'auto',
              padding: '150px 30px 30px 0',
              flex: 0.75,
            }}
            spacing={0}
          >
            <Text
              size={48}
              color="#fff"
              weight={700}
              sx={{
                lineHeight: 1,
                marginBottom: 60,
              }}
            >
              { title.title }
            </Text>
            <Text
              size={14}
              color="#98989a"
              sx={{
                marginBottom: 30,
              }}
            >
              { title.synopsis }
            </Text>
            <DownloadButton torrents={title.torrents} onTorrentSelect={onTitleSelect} />
            {title.trailer && (
              <AspectRatio
                ratio={16 / 9}
                sx={{
                  width: '100%',
                  maxWidth: 800,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginTop: 30,
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={ 'https://www.youtube.com/embed/' + title.trailer.split('watch?v=')[1] }
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              </AspectRatio>
            )}
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
};

export default TitleDisplay;