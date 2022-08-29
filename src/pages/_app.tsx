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
};

const TextInputDefaultProps: Partial<TextInputProps> = {
  radius: 12,
  size: 'sm',
  styles: {
    input: {
      backgroundColor: '#2f2f3d',
      color: '#fff',

      '&::placeholder': {
        color: '#98989a',
      }
    },
  }
};

const PasswordInputDefaultProps: Partial<PasswordInputProps> = {
  radius: 12,
  size: 'sm',
  styles: {
    input: {
      backgroundColor: '#2f2f3d',
    },
    innerInput: {
      color: '#fff',
      '&::placeholder': {
        color: '#98989a !important',
      }
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