import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';

import '../styles.css';

import { MantineProvider } from '@mantine/core';

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
            Button: {
              defaultProps: {
                radius: 12,
              },
            },
            Paper: {
              defaultProps: {
                
              },
            }
          },
          colorScheme: 'dark',
          colors: {
            brand: ['#00a152', '#00a152', '#00a152', '#00a152', '#00a152', '#00a152', '#00a152', '#00a152', '#00a152','#00a152'],
          },
          primaryColor: 'brand',
        }} 
        withGlobalStyles 
        withNormalizeCSS
      >
        <Component {...pageProps} />
      </MantineProvider>
    </React.Fragment>
  );
}