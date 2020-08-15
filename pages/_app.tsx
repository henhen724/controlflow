import { ApolloProvider } from '@apollo/react-hooks';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { NormalizedCache } from 'apollo-cache-inmemory';
import CssBaseline from '@material-ui/core/CssBaseline';

import { useApollo } from '../apollo/client';
import Theme from '../components/theme';



// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps<{ initialApolloState: NormalizedCache }>) {
  const myApolloClient = useApollo(pageProps.initialApolloState);

  return (<div>
    <Head>
      <title>Wi-DAQ</title>
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <link rel="icon" type="image/svg+xml" href="favicon.svg" sizes="any" />
      <link rel="alternate icon" href="favicon.ico" />
    </Head>
    <ApolloProvider client={myApolloClient}>
      <Theme>
        <CssBaseline />
        < Component {...pageProps} />
      </Theme>
    </ApolloProvider>
  </div>);
}