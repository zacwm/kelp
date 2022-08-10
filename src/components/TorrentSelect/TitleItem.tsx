import * as React from 'react';

import { Box, Text, Paper, Group, Transition } from '@mantine/core';

type Props = {
  title: any;
  onSelect: () => void;
  delayIndex: number;
}

const MovieItem: React.FC<Props> = ({ title, onSelect, delayIndex }) => {
  const [isTransitionDelayed, setIsTransitionDelayed] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsTransitionDelayed(true), delayIndex);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        margin: '10px',
        height: '380px',
        width: '200px',
        boxSizing: 'border-box',
      }}
    >
      <Transition
        mounted={isTransitionDelayed}
        transition="fade"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => 
          <Paper
            shadow="md"
            radius="sm"
            sx={{
              display: 'inline-block',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
              background: '#2C2E33',
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',

              '&:hover': {
                background: 'rgba(57, 59, 66)',
              },
            }}
            onClick={() => onSelect()}
            style={styles}
          >
            <img src={ title.images?.poster } alt={ title.title } width="200px" loading="lazy" />
            <Box sx={{ padding: '4px 6px' }}>
              <Text weight={600}>{ title.title }</Text>
              <Group spacing="xs">
                <Text size={12}>{ title.year }</Text>
                <Text size={12}>{ title.certification }</Text>
              </Group>
            </Box>
          </Paper>
        }
      </Transition>
    </Box>
  );
};

export default MovieItem;