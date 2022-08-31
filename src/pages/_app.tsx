import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';

import '../styles.css';

import {
  MantineProvider,
  ButtonProps,
  PasswordInputProps,
  TextInputProps,
  SelectProps,
} from '@mantine/core';

const kelpPalette: any = ['#000000', '#08080f', '#191921', '#2f2f3d', '#3bd4ae', '#98989a', '#ffffff', '#ae95da', '#00bc70', '#00a19b'];

const ButtonDefaultProps: Partial<ButtonProps> = {
  radius: 12,
  variant: 'gradient',
  gradient: { from: kelpPalette[8], to: kelpPalette[9], deg: 135 },
  styles: {
    root: {
      transition: '.2s ease-in-out',
      backgroundImage: `linear-gradient(135deg, ${kelpPalette[8]} 0%, ${kelpPalette[9]} 100%)`,
      
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
      backgroundColor: kelpPalette[3],
      color: '#fff',
      border: `1px solid ${kelpPalette[3]}`,

      '&::placeholder': {
        color: kelpPalette[5],
      },

      '&:disabled': {
        backgroundColor: kelpPalette[2],
        color: kelpPalette[3],
        border: `1px solid ${kelpPalette[2]}`,
      },
    },
  }
};

const PasswordInputDefaultProps: Partial<PasswordInputProps> = {
  radius: 12,
  size: 'sm',
  styles: {
    input: {
      backgroundColor: kelpPalette[3],
      border: `1px solid ${kelpPalette[3]}`,

      '&:disabled': {
        backgroundColor: kelpPalette[2],
        border: `1px solid ${kelpPalette[2]}`,
      },
    },
    innerInput: {
      color: '#fff',

      '&::placeholder': {
        color: `${kelpPalette[5]} !important`,
      },

      '&:disabled': {
        backgroundColor: kelpPalette[2],
        color: kelpPalette[3],
        border: `1px solid ${kelpPalette[2]}`,
      },
    },
    visibilityToggle: {
      color: kelpPalette[5],

      '&:disabled': {
        backgroundColor: kelpPalette[2],
      },
    },
    disabled: {
      backgroundColor: kelpPalette[2],
      border: `1px solid ${kelpPalette[2]}`,
    }
  }
};

const SelectDefaultProps: Partial<SelectProps> = {
  styles: {
    input: {
      borderRadius: 12,
      width: 200,
      backgroundColor: kelpPalette[2],
      border: 'none',
      color: kelpPalette[4],
      fontWeight: 700,
    },
    dropdown: {
      borderRadius: 12,
      backgroundColor: kelpPalette[2],
      border: 'none',
      color: kelpPalette[5],
    },
    item: {
      borderRadius: 12,
      '&:hover': {
        backgroundColor: kelpPalette[3],
      },
    },
  },
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
            Select: { defaultProps: SelectDefaultProps },
          },
          colorScheme: 'dark',
          colors: {
            brand: ['#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae', '#3bd4ae','#3bd4ae'],
            kelpPalette: kelpPalette,
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