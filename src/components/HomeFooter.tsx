import React from 'react';
import axios from 'axios';

import { Paper, Group, Text } from '@mantine/core';

const HomeFooter: React.FC = () => {
  const [status, setStatus] = React.useState<any>({});

  React.useEffect(() => {
    axios.get('/status').then((res) => {
      setStatus(res.data);
    });
  }, []);
  
  return (
    <Paper
      p="md" 
      sx={{
        position: 'absolute',
        bottom: '0px',
        left: 0,
        right: 0,
        textAlign: 'center',
        backgroundColor: '#08080f',
      }}
    >
      <Group
        position="center"
      >
        { status?.version && (
          <Text
            size="sm"
          >
            Version: {status.version}
          </Text>
        ) }
        { status?.commit && (
          <Text
            size="sm"
          >
            Commit:
            <Text
              variant="link"
              component="a"
              target="_blank"
              href={`https://github.com/zacimac/kelp/commit/${status.commit}`}
              size="sm"
              sx={{ marginLeft: 4 }}
            >
              {status.commit.substring(0, 7)}
            </Text>
          </Text>
        ) }
        <Text
          variant="link"
          component="a"
          target="_blank"
          href="https://github.com/zacimac/kelp"
          size="sm"
        >
          GitHub
        </Text>
      </Group>
    </Paper>
  );
};

export default HomeFooter;