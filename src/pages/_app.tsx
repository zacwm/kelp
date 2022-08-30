import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';

import '../styles.css';

import {
  MantineProvider,
  ButtonProps,
  PasswordInputProps,
  TextInputProps, 
} from '@mantine/core';

const ButtonDefaultProps: Partial<ButtonProps> = {
  radius: 12,
  variant: 'gradient',
  gradient: { from: '#00bc70', to: '#00a19b', deg: 135 },
  styles: {
    root: {
      transition: '.2s ease-in-out',
      backgroundImage: 'linear-gradient(135deg, #00bc70 0%, #00a19b 100%)',
      
      '&:hover, &:focus': {
        transform: 'scale(1.05)',
        backgroundSize: '100% !important',
      },

      '&:disabled': {
        color: '#fff',
      },
    },
  },
};

const TextInputDefaultProps: Partial<TextInputProps> = {
  radius: 12,
  size: 'sm',
  styles: {
    input: {
      backgroundColor: '#2f2f3d',
      color: '#fff',
      border: '1px solid #2f2f3d',

      '&::placeholder': {
        color: '#98989a',
      },

      '&:disabled': {
        backgroundColor: '#191921',
        color: '#2f2f3d',
      },
    },
  }
};

const PasswordInputDefaultProps: Partial<PasswordInputProps> = {
  radius: 12,
  size: 'sm',
  styles: {
    input: {
      backgroundColor: '#2f2f3d',
      border: '1px solid #2f2f3d',

      '&:disabled': {
        backgroundColor: '#191921',
      },
    },
    innerInput: {
      color: '#fff',

      '&::placeholder': {
        color: '#98989a !important',
      },

      '&:disabled': {
        backgroundColor: '#191921',
        color: '#2f2f3d',
      },
    },
    visibilityToggle: {
      color: '#98989a',

      '&:disabled': {
        backgroundColor: '#191921',
      },
    },
    disabled: {
      backgroundColor: '#191921',
    }
  }
};

export default function App(props: AppProps ) {
  const { Component, pageProps } = props;
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <MantineProvider 
        theme={{
          components: {
            Button: { defaultProps: ButtonDefaultProps },
            TextInput: { defaultProps: TextInputDefaultProps },
            PasswordInput: { defaultProps: PasswordInputDefaultProps },
            Stack: {
              styles: {
                root: {
                  boxSizing: 'border-box',
                },
              },
            },
          },
          colorScheme: 'dark',
          colors: {
            brand: ['#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae','#3bd4ae'],
          },
          primaryColor: 'brand',
        }}
        withNormalizeCSS
      >
        <Component {...pageProps} />
      </MantineProvider>
    </React.Fragment>
  );
}