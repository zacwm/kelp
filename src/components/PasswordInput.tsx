import * as React from 'react';

import { PasswordInput as MantinePasswordInput } from '@mantine/core';

const PasswordInput: React.FC<any> = (props) => {
  return (
    <MantinePasswordInput
      {...props}
      size="sm"
      radius={12}
      styles={{
        input: {
          backgroundColor: '#2f2f3d',
        },

        innerInput: {
          color: '#fff',

          '&::placeholder': {
            color: '#98989a !important',
          }
        }
      }}
    />
  );
};

export default PasswordInput;