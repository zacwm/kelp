import * as React from 'react';

import { useUser } from '../../../contexts/user.context';

import { UnstyledButton, Group, Button, Popover } from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

type Props = {
  torrents: any,
  forceLang?: string,
  onTorrentSelect: (torrentData: any) => void,
}

const DownloadButton: React.FC<Props> = ({ torrents, forceLang, onTorrentSelect }) => {
  const { user } = useUser();
  if (!torrents) return null;
  
  const hasMultipleLanguages: boolean = forceLang ? false : Object.keys(torrents).length > 1;
  let reducedTorrents: any;
  
  if (forceLang) {
    // filter for qualityies ending with p
    const filteredTorrents = Object.keys(torrents).filter((key: string) => key.endsWith('p'));
    reducedTorrents = filteredTorrents.map((key: string) => {
      return {
        language: forceLang,
        quality: key,
        ...torrents[key],
      };
    });
  } else {
    reducedTorrents = Object.values(torrents).reduce((acc: any, val: any, index: number) => {
      const qualities = Object.keys(val).map((key: string) => {
        return {
          language: Object.keys(torrents)[index],
          quality: key,
          ...val[key],
        };
      });
      return [...acc, ...qualities];
    }, []);
  }

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

  const hasPermission: boolean = user && ['host', 'controller'].includes(user.permission) || false;
  if (!hasPermission) return null;

  return (
    <UnstyledButton
      sx={{
        position: 'relative',
        display: 'block',
        width: 'fit-content',
        borderRadius: 12,
        backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%)',
        cursor: 'pointer',
        zIndex: 200,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        margin: '0 10px',
      }}
    >
      <Group
        spacing={0}
      >
        <Button
          sx={{
            backgroundImage: 'none',
            borderRadius: '12px 0 0 12px',
            fontSize: 16,
          }}
          onClick={() => onTorrentSelect({ url: defaultTorrent.url, file: defaultTorrent?.file })}
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
              marginTop: 18,
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
                      },
                    }}
                    onClick={() => onTorrentSelect({ url: torrent.url, file: torrent?.file })}
                  >
                    {hasMultipleLanguages && `${torrent.language} - `}{torrent.quality}
                  </Button>
                );
              })
            }
          </Popover.Dropdown>
        </Popover>
      </Group>
    </UnstyledButton>
  );
};

export default DownloadButton;