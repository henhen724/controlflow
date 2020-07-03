import { ApolloProvider } from '@apollo/react-hooks';
import { useApollo } from '../apollo/client';
import { AppProps } from 'next/app';
import { NormalizedCache } from 'apollo-cache-inmemory';

import '../css/index.scss'

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps<{ initialApolloState: NormalizedCache }>) {
  const myApolloClient = useApollo(pageProps.initialApolloState);

  return (<ApolloProvider client={myApolloClient}>
    < Component {...pageProps} />
  </ApolloProvider >);
}