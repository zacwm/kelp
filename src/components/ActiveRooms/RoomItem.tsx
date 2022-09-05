import * as React from 'react';
import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

import { UnstyledButton, Text } from '@mantine/core';

type Props = {
  room: any;
}

const RoomItem: React.FC<Props> = ({ room }) => {
  const router = useRouter();

  const color = room.hasPassword ? '#ae95da' : '#3bd4ae';

  return(
    <Box
      sx={{
        display: 'flex',
        backgroundColor: '#191921',
        borderRadius: '12px',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        marginBottom: '15px',
      }}    
    >
      <FontAwesomeIcon 
        icon={room.hasPassword ? faLock : faUnlock} 
        style={{ 
          fontSize:'23px', 
          color: color, 
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
        <Text size="md" weight={700} color={color} >
          {room.name}
        </Text>
        <Text size="xs" sx={{ color: '#98989a' }}>
          {room.status}
        </Text>
      </Stack>
      <UnstyledButton onClick={() => router.push(`/room/${room.id}`)} 
        sx={{ 
          color: color,
          marginRight: '25px',
        }} 
      >
        <Text weight={700}>
          Join
        </Text>
      </UnstyledButton>
    </Box>
  );
};

export default RoomItem;