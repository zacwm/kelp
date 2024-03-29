import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';

import 'styles.css';

import {
  MantineProvider,
  ButtonProps,
  PasswordInputProps,
  TextInputProps,
  SelectProps,
  ScrollAreaProps,
  AccordionProps,
  SliderProps,
} from '@mantine/core';

const kelpPalette: any = [
  '#000000',
  '#08080f',
  '#191921',
  '#2f2f3d',
  '#3bd4ae',
  '#98989a',
  '#ffffff',
  '#ae95da',
  '#00bc70',
  '#00a19b',
];

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
  },
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
    },
  },
};

const SelectDefaultProps: Partial<SelectProps> = {
  styles: {
    input: {
      borderRadius: 12,
      width: 200,
      backgroundColor: kelpPalette[3],
      border: 'none',
      color: kelpPalette[4],
      fontWeight: 700,
    },
    dropdown: {
      padding: 0,
      marginTop: -3,
      borderRadius: 12,
      backgroundColor: kelpPalette[3],
      border: 'none',
      color: kelpPalette[5],
      overflow: 'hidden',

      '.mantine-ScrollArea-scrollbar': {
        backgroundColor: 'transparent',
      },
      
      '.mantine-ScrollArea-thumb': {
        backgroundColor: 'rgba(152, 152, 154, 0.5)',
        '&:hover': {
          backgroundColor: 'rgba(152, 152, 154, 0.75) !important',
        },
      },

      '.mantine-ScrollArea-viewport *:not(.mantine-Select-item)': {
        padding: '0 !important',
      },
    },
    item: {
      borderRadius: 12,
      height: 36,
      padding: '7px 12px',

      '&[data-selected]': {
        '&, &:hover': {
          backgroundImage: `linear-gradient(135deg, ${kelpPalette[8]} 0%, ${kelpPalette[9]} 100%)`,
        },
      },

      '&[data-hovered]': {
        backgroundColor: kelpPalette[2],
      },
    },
  },
};

const ScrollAreaDefaultProps: Partial<ScrollAreaProps> = {
  scrollbarSize: 10,
  styles: {
    scrollbar: {
      backgroundColor: 'transparent',

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    thumb: {
      backgroundColor: kelpPalette[3],
      '&:hover': {
        backgroundColor: `${kelpPalette[3]} !important`,
      },
    },
  },
};

const AccordionDefaultProps: Partial<AccordionProps> = {
  styles: {
    item: {
      backgroundColor: 'transparent',
      border: `2px solid ${kelpPalette[3]}`,
      color: kelpPalette[5],

      '&[data-active]': {
        backgroundColor: 'transparent',
        border: `2px solid ${kelpPalette[3]}`,
      },
    },
    content: {
      padding: '0 30px 30px 30px',
    },
  },
};

const SliderDefaultProps: Partial<SliderProps> = {
  size: 5,
  styles: {
    bar: {
      backgroundImage: `linear-gradient(135deg, ${kelpPalette[8]} 0%, ${kelpPalette[9]} 100%)`,
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
    },
    thumb: {
      border: 'none',
      backgroundColor: 'none',
      backgroundImage: `linear-gradient(135deg, ${kelpPalette[8]} 0%, ${kelpPalette[9]} 100%)`,
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
    },
  },
};

export default function App(props: AppProps ) {
  const { Component, pageProps } = props;
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3bd4ae" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
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
            ScrollArea: { defaultProps: ScrollAreaDefaultProps },
            Accordion: { defaultProps: AccordionDefaultProps },
            Slider: { defaultProps: SliderDefaultProps },
          },
          colorScheme: 'dark',
          colors: {
            brand: ['#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae',
              '#3bd4ae'],
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