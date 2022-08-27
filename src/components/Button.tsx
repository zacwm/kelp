import * as React from 'react';

import { Button as MantineButton } from '@mantine/core';

const Button: React.FC<any> = (props) => {
  return (
    <MantineButton
      {...props}
      variant="gradient"  
      gradient={{ from: '#00bc70', to: '#00a19b', deg: 135 }} 
      radius={12}
    />
  );
};

export default Button;