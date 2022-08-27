import * as React from 'react';

import { TextInput as MantineTextInput } from '@mantine/core';

const TextInput: React.FC<any> = (props) => {
  return (
    <MantineTextInput
      {...props}
      size="sm"
      radius={12}
      styles={{
        input: { backgroundColor: '#2f2f3d' }
      }}
    />
  );
};

export default TextInput;