import * as React from 'react';

import { Box, Stack, Group, Text, Button, ActionIcon, Badge, Select, AspectRatio } from '@mantine/core';

import { IconArrowLeft, IconExternalLink, IconClock, IconCalendar, IconStar } from '@tabler/icons';

const FanartBanner: React.FC<any> = ({ imgSrc }) => {
  const srcSplit = imgSrc.split('/');
  const getImagesId = srcSplit[srcSplit.length - 1];
  const sourceUrl = `https://image.tmdb.org/t/p/w1920_and_h1080_multi_faces/${getImagesId}`;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '400px',
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
}

const TitleDisplay: React.FC<Props> = ({ styles, title, onTitleSelect, close }) => {
  if (!title) return null;

  const [optsTorrentLangs, setOptsTorrentLangs] = React.useState([]);
  const [optsTorrentRes, setOptsTorrentRes] = React.useState([]);

  const [inputTorrentLang, setInputTorrentLang] = React.useState('');
  const [inputTorrentRes, setInputTorrentRes] = React.useState('');

  React.useEffect(() => {
    if (!title) return null;

    const langOpts = Object.keys(title.torrents);
    if (!langOpts) return;
  
    setOptsTorrentLangs(langOpts);

    if (langOpts.includes('en')) {
      // Sorry, but english would be the most commonly used, especially while kelp is english only.
      setInputTorrentLang('en');
    } else {
      // Select first from options if english isn't found.
      setInputTorrentLang(langOpts[0]);
    }
  }, [title]);

  React.useEffect(() => {
    if (!title) return;
    if (!inputTorrentLang) return;

    const resOpts = Object.keys(title.torrents[inputTorrentLang]);
    if (!resOpts) return;

    setOptsTorrentRes(resOpts);

    if (resOpts.includes('1080p')) {
      // Why not the highest? well 4k and above is f**kin HUGE in file size after it's uncompressed, I doubt its necessary for most people.
      setInputTorrentRes('1080p');
    } else {
      // If 1080 isn't an option, I'm still not risking the highest file size, so we go smallest! KEKW
      setInputTorrentRes(resOpts[0]);
    }
  }, [inputTorrentLang]);

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
      <Stack
        sx={{
          height: '100%',
          width: '100%',
          padding: '8px 16px',
          position: 'relative',
          boxSizing: 'border-box',
        }}
        spacing={0}
      >
        <Group position="apart" spacing="xl" align="center">
          <Group>
            <ActionIcon onClick={close} size="lg">
              <IconArrowLeft size={30} />
            </ActionIcon>
          </Group>
          <Group>
            <Select
              label="Audio Language"
              data={optsTorrentLangs.map((lang) => {
                return { value: lang, label: lang };
              })}
              value={inputTorrentLang}
              onChange={setInputTorrentLang}
              dropdownPosition="bottom"
            />
            <Select
              label="Video Resolution"
              data={optsTorrentRes.map((res) => {
                return { value: res, label: res };
              })}
              value={inputTorrentRes}
              onChange={setInputTorrentRes}
              dropdownPosition="bottom"
            />
            <Button
              size="md"
              onClick={() => onTitleSelect(title.torrents[inputTorrentLang][inputTorrentRes].url)}
              disabled={!inputTorrentLang || !inputTorrentRes}
            >
              Start Download
            </Button>
          </Group>
        </Group>
        <Group
          sx={{
            position: 'relative',
            padding: '10px 6%',
            overflowY: 'auto',
            height: '100%',
          }}
          align="flex-start"
        >
          <Stack
            sx={{
              width: '250px',
              marginRight: '40px',
              position: 'relative',
            }}
          >
            <img
              src={ title.images?.poster }
              alt={ title.title }
              width="250px"
              loading="lazy"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgb(0 0 0 / 5%), rgb(0 0 0 / 5%) 0px 20px 25px -5px, rgb(0 0 0 / 4%) 0px 10px 10px -5px',
              }}
            />
            <Group spacing={5}>
              <IconClock size={18} />
              <Text sx={{ marginRight: '8px' }}>{ formatTitleRuntime() }</Text>

              <IconCalendar size={18} />
              <Text sx={{ marginRight: '8px' }}>{ title.year }</Text>

              <IconStar size={18} />
              <Text sx={{ marginRight: '8px' }}>{ title.rating.percentage }%</Text>
            </Group>
            <Group>
              {(title.genres || []).map((genre, index) => <Badge key={index}>{ genre }</Badge>)}
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
          <Stack
            sx={{
              height: '100%',
              flex: 0.75,
            }}
          >
            <Text
              size={38}
              color="#fff"
              weight={700}
            >
              { title.title }
            </Text>
            <Text size={15} color="#98989a">{ title.synopsis }</Text>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                marginTop: 30,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {title.trailer && (
                <AspectRatio
                  ratio={16 / 9}
                  sx={{
                    width: '100%',
                    maxWidth: 800,
                    borderRadius: '10px',
                    overflow: 'hidden',
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
            </Box>
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
};

export default TitleDisplay;