import * as React from 'react';
import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import { UnstyledButton, Text } from '@mantine/core';

type Props = {
  room: any;
}

const LockedRoom: React.FC<Props> = ({ room }) => {
  const router = useRouter();

  return(
    <Box
      sx={{
        mx: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%', 
      }}    
    >
      <FontAwesomeIcon 
        icon={faLock} 
        style={{ 
          fontSize:'30px', 
          color: '#ae95da', 
        }} 
      />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start" 
        spacing={0}
        sx={{ flex: 1 }}
      >
        <Text size="xl" weight={700} color="#ae95da" >
          {room.name}
        </Text>
        <Text size="sm" italic>
          {room.status}
        </Text>
      </Stack>
      <UnstyledButton onClick={() => router.push(`/room/${room.id}`)} sx={{ color: '#ae95da' }} >Join Room</UnstyledButton>
    </Box>
  );
};

export default LockedRoom;