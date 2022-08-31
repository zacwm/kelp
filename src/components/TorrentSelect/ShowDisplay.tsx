import * as React from 'react';

import EpisodeItem from './EpisodeItem';

import { Accordion, Box, Stack, Group, Text, Button, ActionIcon, Badge, ScrollArea, Loader } from '@mantine/core';

import { IconArrowLeft, IconExternalLink } from '@tabler/icons';

const FanartBanner: React.FC<any> = ({ imgSrc }) => {
  const srcSplit = imgSrc.split('/');
  const getImagesId = srcSplit[srcSplit.length - 1];
  const sourceUrl = `https://image.tmdb.org/t/p/w1920_and_h1080_multi_faces/${getImagesId}`;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '50%',
        top: 0,
        left: 0,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), #191921), url(${sourceUrl});`,
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
  close: () => void,
  socket: any,
}

const TitleDisplay: React.FC<Props> = ({ styles, title, onTitleSelect, close, socket }) => {
  if (!title) return null;

  const [isLoading, setIsLoading] = React.useState(true);
  const [showData, setShowData] = React.useState<any>({});
  const [seasonEpisodesData, setSeasonEpisodesData] = React.useState<any>({});

  React.useEffect(() => {
    socket.emit('getShowData', title['_id'], (response) => {
      setIsLoading(false);
      if (response.show) return setShowData(response.show);
    });
  }, []);

  React.useEffect(() => {
    if (!showData) return;
    if (!showData.episodes) return;

    const seasonObj = {};

    showData.episodes.forEach(ep => {
      if (ep.season in seasonObj) {
        seasonObj[ep.season] = [...seasonObj[ep.season], ep];
      } else {
        seasonObj[ep.season] = [ep];
      }
      seasonObj[ep.season].sort((a, b) => { return a.episode - b.episode; });
    });

    setSeasonEpisodesData(seasonObj);
  }, [showData]);

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
      <Stack sx={{
        height: '100%',
        width: '100%',
        padding: '8px 16px',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        <Group position="apart" spacing="xl" align="center">
          <Group>
            <ActionIcon onClick={close} size="lg">
              <IconArrowLeft size={30} />
            </ActionIcon>
          </Group>
        </Group>
        {!isLoading ? (
          <Box sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            padding: '10px 6%',
            overflowY: 'auto',
            height: '100%'
          }}>
            <Stack
              sx={{
                width: '250px',
                marginRight: '40px',
                position: 'relative',
              }}
            >
              <img src={title.images?.poster} alt={title.title} width="250px" loading="lazy" />
              <Group>
                <Text>Year: {title.year}</Text>
                <Text>Rating: {title.rating.percentage}%</Text>
              </Group>
              <Group>
                <Button
                  compact
                  leftIcon={<IconExternalLink />}
                  onClick={() => window.open(`https://www.imdb.com/title/${title['imdb_id']}`, '_blank', 'noopener,noreferrer')}
                >
                  IMDB
                </Button>
              </Group>
              <Group>
                {(showData.genres || []).map((genre, index) => <Badge key={index}>{genre}</Badge>)}
              </Group>
            </Stack>
            <Stack
              sx={{
                position: 'relative',
                flex: 1,
                height: '100%',
                width: '100%',
              }}
            >
              <Text size={38}>{ showData.title }</Text>
              <Text size={14}>{ showData.synopsis }</Text>
              <ScrollArea
                sx={{
                  height: '100%',
                  wdith: '100%',
                  margin: '10px',
                }}
              >
                <Accordion chevronPosition="left" sx={{ maxHeight: 500 }}>
                  {
                    Object.keys(seasonEpisodesData).sort((a, b) => { return parseInt(a) - parseInt(b); }).map((season, sIndex) => (
                      <Accordion.Item value={`season${season}`} key={sIndex}>
                        <Accordion.Control>Season {season}</Accordion.Control>
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
              </ScrollArea>
            </Stack>
          </Box>
        ) : (
          <Stack
            align="center"
            sx={{
              height: '100%',
              width: '100%',
            }}
          >
            <Loader />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default TitleDisplay;