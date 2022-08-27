import * as React from 'react';

import { PasswordInput as MantinePasswordInput } from '@mantine/core';

const PasswordInput: React.FC<any> = (props) => {
  return (
    <MantinePasswordInput
      {...props}
      size="sm"
      radius={12}
      styles={{
        input: { backgroundColor: '#2f2f3d' }
      }}
    />
  );
};

export default PasswordInput;