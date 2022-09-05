import * as React from 'react';

import { useSocket } from 'contexts/socket.context';

import { Accordion, Box, Center, Stack, Group, Text, Button, ActionIcon, Badge, AspectRatio, Loader, ScrollArea } from '@mantine/core';

import { IconArrowLeft, IconExternalLink } from '@tabler/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faStar, faClock, faCircleQuestion } from '@fortawesome/free-regular-svg-icons';

import EpisodeItem from './EpisodeItem';
import DownloadButton from './DownloadButton';

const FanartBanner: React.FC<any> = ({ imgSrc }) => {
  const srcSplit = (imgSrc || '').split('/');
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
  type: string,
  onTitleSelect: (url: string) => void,
  setGenre: React.Dispatch<React.SetStateAction<string | null>>,
  close: () => void,
}

const TitleDisplay: React.FC<Props> = ({
  styles,
  title,
  type,
  onTitleSelect,
  setGenre,
  close,
}) => {
  const { socket } = useSocket();

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [titleOverview, setTitleOverview] = React.useState<any>({});
  const [titleDetailed, setTitleDetailed] = React.useState<any>({});
  const [seasonEpisodesData, setSeasonEpisodesData] = React.useState<any>({});
  
  React.useEffect(() => {
    if (!title) return;
    setTitleOverview(title);
  }, [title]);

  React.useEffect(() => {
    socket.emit('getTitleDetails', { type, id: title['_id'] }, (response) => {
      setIsLoading(false);
      if (response.error) {
        return console.error(response.error);
      }
      if (response) return setTitleDetailed(response);
    });
  }, []);

  React.useEffect(() => {
    if (!titleDetailed) return;
    if (!titleDetailed.episodes) return;

    const seasonObj = {};

    titleDetailed.episodes.forEach(ep => {
      if (ep.season in seasonObj) {
        seasonObj[ep.season] = [...seasonObj[ep.season], ep];
      } else {
        seasonObj[ep.season] = [ep];
      }
      seasonObj[ep.season].sort((a, b) => { return a.episode - b.episode; });
    });

    setSeasonEpisodesData(seasonObj);
  }, [titleDetailed]);

  const formatTitleRuntime = () => {
    const minutes = parseInt(titleOverview.runtime);
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
      <FanartBanner imgSrc={titleOverview?.images?.fanart} />
      <ActionIcon
        onClick={close}
        size="lg"
        sx={{
          position: 'absolute',
          top: 30,
          left: 30,
          zIndex: 1000,
        }}
      >
        <IconArrowLeft size={30} />
      </ActionIcon>
      {
        isLoading ? (
          <Center
            sx={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              top: 0,
              left: 0,
              zIndex: 999,
            }}
          >
            <Loader size={50} />
          </Center>
        ) : (
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
                  src={ titleOverview?.images?.poster }
                  alt={ titleOverview.title }
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
                        { titleOverview.year }
                      </Text>
                    </Group>
                    
                    { titleDetailed.certification && (
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
                          { titleDetailed.certification }
                        </Text>
                      </Group>
                    )}

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
                        { type === 'movies' ? formatTitleRuntime() : `${titleDetailed.num_seasons} Season${parseInt(titleDetailed.num_seasons) > 1 ? 's' : ''}` }
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
                        { titleOverview.rating.percentage / 10 }
                      </Text>
                    </Group>
                  </Group>
                  <Group spacing={10}>
                    {(titleDetailed.genres || []).map((genre, index) => <Badge
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
              <ScrollArea
                sx={{
                  height: '100%',
                  flex: 1,
                }}
                offsetScrollbars
                styles={{
                  scrollbar: {
                    backgroundColor: 'transparent',
                    margin: 15,
              
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  },
                  thumb: {
                    backgroundColor: '#2f2f3d',
                    '&:hover': {
                      backgroundColor: '#2f2f3d !important',
                    },
                  },
                }}
              >
                <Stack
                  sx={{
                    padding: '150px 30% 0 0',
                    // TODO: Fix the margin bottom when there is an accordion. Height measurement is not working.
                    marginBottom: 150,
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
                    { titleOverview.title }
                  </Text>
                  <Text
                    size={14}
                    color="#98989a"
                    sx={{
                      marginBottom: 30,
                      maxWidth: 930,
                    }}
                  >
                    { titleDetailed.synopsis }
                  </Text>
                  <DownloadButton torrents={titleOverview.torrents} onTorrentSelect={onTitleSelect} />
                  {titleOverview.trailer && (
                    <AspectRatio
                      ratio={16 / 9}
                      sx={{
                        width: '100%',
                        maxWidth: 800,
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginTop: 60,
                      }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        src={ 'https://www.youtube.com/embed/' + titleOverview.trailer.split('watch?v=')[1] }
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                      />
                    </AspectRatio>
                  )}
                  {(type === 'shows' && titleDetailed.episodes) && (
                    <Accordion
                      variant="separated"
                      chevronPosition="left"
                      radius={12}
                      sx={{
                        maxHeight: 500,
                      }}
                    >
                      {
                        Object.keys(seasonEpisodesData).sort((a, b) => { return parseInt(a) - parseInt(b); }).map((season, sIndex) => (
                          <Accordion.Item value={`season${season}`} key={sIndex}>
                            <Accordion.Control
                              sx={{
                                padding: 30,
                                lineHeight: 1,
                              }}
                            >
                              Season {season}
                            </Accordion.Control>
                            <Accordion.Panel>
                              {
                                seasonEpisodesData[season].map((episode, eIndex) => (
                                  <EpisodeItem
                                    key={eIndex}
                                    episodeData={episode}
                                    onSelect={onTitleSelect}
                                  />
                                ))
                              }
                            </Accordion.Panel>
                          </Accordion.Item>
                        ))
                      }
                    </Accordion>
                  )}
                </Stack>
              </ScrollArea>
            </Group>
          </Stack>
        )
      }
    </Box>
  );
};

export default TitleDisplay;