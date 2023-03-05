import * as React from 'react';
import axios from 'axios';

import { useVideo } from 'contexts/video.context';

import { Box, Stack, Text } from '@mantine/core';

type SubtitleItemProps = {
  content: string;
};

const SubtitleItem: React.FC<SubtitleItemProps> = ({ content }) => {
  return (
    <Box
      sx={{
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
      }}
    >
      <Text
        color="white"
        size={30}
        sx={{
          margin: 0,
        }}
      >
        {content}
      </Text>
    </Box>
  );
};

type SubtitleDisplayProps = {
  currentTime: number;
  overlayShowing: boolean;
};

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ currentTime, overlayShowing }) => {
  const { video, setSubtitles, selectedSubtitle, setSelectedSubtitle } = useVideo();

  const [subtitleData, setSubtitleData] = React.useState<any>(null);

  const [subtitleCues, setSubtitleCues] = React.useState<any[]>([]);
  const [currentActiveCues, setCurrentActiveCues] = React.useState<any[]>([]);

  // Fetch subtitle cues from the server
  React.useEffect(() => {
    if (!video?.subtitle) return setSelectedSubtitle(-1);
    axios.get(video.subtitle)
      .then((response) => {
        if (response.status !== 200) return console.error('Failed to fetch subtitle data');
        console.dir(response?.data);
        setSubtitleData(response?.data);
        setSubtitles(response.data?.tracks || []);
        if (response.data?.tracks?.length > 0) setSelectedSubtitle(0);
      });
  }, [video]);

  React.useEffect(() => {
    if (selectedSubtitle === -1) return setSubtitleCues([]);
    // Check if the selected subtitle is a valid index
    if (!subtitleData.cues) return setSubtitleCues([]);
    if (selectedSubtitle < 0 || selectedSubtitle >= subtitleData.cues.length) return setSubtitleCues([]);
    setSubtitleCues(subtitleData.cues[selectedSubtitle]);
  }, [selectedSubtitle]);

  // Based on currentTime, fetch any active subtitle cues
  React.useEffect(() => {
    // Each subtitleCue item has a start and finish timestamp in milliseconds
    // We want to find all subtitleCues that are currently 'active' (i.e. the current time is between or on the start and finish timestamps)
    const activeCues = subtitleCues.filter((cue) => {
      return cue.start <= currentTime * 1000 && cue.end >= currentTime * 1000;
    });
    setCurrentActiveCues(activeCues);
  }, [currentTime, subtitleCues]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: overlayShowing ? '10vh' : '1vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        transition: 'bottom 0.5s',
      }}
    >
      <Stack
        spacing={2}
        align="center"
      >
        {
          currentActiveCues.map((cue) => {
            return (
              <SubtitleItem
                key={cue.id}
                content={cue.text}
              />
            );
          })
        }
      </Stack>
    </Box>
  );
};

export default SubtitleDisplay;