import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { AppProps } from 'next/app';
import { NormalizedCache } from 'apollo-cache-inmemory';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useApollo } from '../apollo/client';
import Theme from '../components/theme';
import Head from 'next/head';



// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps<{ initialApolloState: NormalizedCache }>) {
  const myApolloClient = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  })

  return (<>
    <Head>
      <title>Wi-DAQ</title>
    </Head>
    <ApolloProvider client={myApolloClient}>
      <Theme>
        <CssBaseline />
        <Component {...pageProps} />
      </Theme>
    </ApolloProvider>
  </>);
}