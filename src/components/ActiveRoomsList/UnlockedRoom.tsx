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
        display: 'flex',
        backgroundColor: '#2f2f3d',
        borderRadius: '12px',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '96%',
        height: '100%', 
      }}    
    >
      <FontAwesomeIcon 
        icon={faUnlock} 
        style={{ 
          fontSize:'23px', 
          color: '#3bd4ae', 
          margin: '20px',
        }} 
      />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start" 
        spacing={0}
        sx={{ flex: 1 }}
      >
        <Text size="md" weight={700} color="#3bd4ae" >
          {room.name}
        </Text>
        <Text size="xs">
          {room.status}
        </Text>
      </Stack>
      <UnstyledButton onClick={() => router.push(`/room/${room.id}`)} 
        sx={{ 
          color: '#3bd4ae',
          marginRight: '25px',
        }} 
      >
        Join
      </UnstyledButton>
    </Box>
  );
};

export default UnlockedRoom;