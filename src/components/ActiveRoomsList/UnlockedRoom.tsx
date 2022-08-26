import * as React from 'react';
import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlock } from '@fortawesome/free-solid-svg-icons';


import { UnstyledButton, Text } from '@mantine/core';

type Props = {
  room: any;
}

const UnlockedRoom: React.FC<Props> = ({ room }) => {
  const router = useRouter();

  return(
    <Box
      sx={{
        mx: 2,
        display: 'flex',
        backgroundColor: '#2f2f3d',
        borderRadius: '12px',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '400px',
        height: '100%', 
      }}    
    >
      <FontAwesomeIcon 
        icon={faUnlock} 
        style={{ 
          fontSize:'30px', 
          color: '#3bd4ae', 
        }} 
      />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start" 
        spacing={0}
        sx={{ flex: 1 }}
      >
        <Text size="xl" weight={700} color="#3bd4ae" >
          {room.name}
        </Text>
        <Text size="sm" italic>
          {room.status}
        </Text>
      </Stack>
      <UnstyledButton onClick={() => router.push(`/room/${room.id}`)} sx={{ color: '#3bd4ae' }} >Join</UnstyledButton>
    </Box>
  );
};

export default UnlockedRoom;