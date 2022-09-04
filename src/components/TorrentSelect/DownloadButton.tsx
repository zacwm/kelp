import * as React from 'react';

import { Box, Group, Button, Popover, Text } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

type Props = {
  torrents: any,
  onTorrentSelect: (url: string) => void,
}

const DownloadButton: React.FC<Props> = ({ torrents, onTorrentSelect }) => {
  const hasMultipleLanguages: boolean = Object.keys(torrents).length > 1;
  const reducedTorrents: any = Object.values(torrents).reduce((acc: any, val: any, index: number) => {
    const qualities = Object.keys(val).map((key: string) => {
      return {
        language: Object.keys(torrents)[index],
        quality: key,
        ...val[key],
      };
    });
    return [...acc, ...qualities];
  }, []);

  reducedTorrents.sort((a: any, b: any) => {
    const aQualityParsed = parseInt(a.quality.replace('p', ''));
    const bQualityParsed = parseInt(b.quality.replace('p', ''));
    // Sort by language then by quality
    if (a.language < b.language) return -1;
    if (a.language > b.language) return 1;
    if (aQualityParsed < bQualityParsed) return 1;
    if (aQualityParsed > bQualityParsed) return -1;
    return 0;
  });

  // Find a 1080p en torrent if not find a 1080p torrent in first language
  const defaultTorrent: any = reducedTorrents.find((torrent: any) => torrent.quality === '1080p' && torrent.language === 'en') || reducedTorrents.find((torrent: any) => torrent.quality === '1080p');

  return (
    <Box
      sx={{
        display: 'inline-block',
        width: 'fit-content',
        borderRadius: 12,
        backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%)',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      <Group spacing={0}>
        <Button
          sx={{
            backgroundImage: 'none',
            borderRadius: '12px 0 0 12px',
            fontSize: 16,
          }}
          onClick={() => onTorrentSelect(defaultTorrent.url)}
        >
          Watch
        </Button>
        <Popover width={120} position="bottom" shadow="md">
          <Popover.Target>
            <Button
              sx={{
                backgroundImage: 'none',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '0 12px 12px 0',
                fontSize: 18,
                padding: '0 12px',
                color: '#3bd4ae',
                '&:hover': {
                  fontSize: 20,
                }
              }}
            >
              <FontAwesomeIcon icon={faAngleDown} />
            </Button>
          </Popover.Target>
          <Popover.Dropdown
            sx={{
              borderRadius: 12,
              backgroundColor: '#2f2f3d',
              border: 'none',
              padding: 0,
            }}
          >
            {
              reducedTorrents.map((torrent: any) => {
                return (
                  <Button
                    key={torrent.url}
                    sx={{
                      width: '100%',
                      borderRadius: 12,
                      backgroundImage: 'none',
                      border: 'none',
                      transition: 'transform 0.2s ease-in-out',
                      transform: 'scale(1) !important',
                      '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%)',
                      }
                    }}
                    onClick={() => onTorrentSelect(torrent.url)}
                  >
                    {hasMultipleLanguages && `${torrent.language} - `}{torrent.quality}
                  </Button>
                );
              })
            }
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Box>
  );
};

export default DownloadButton;