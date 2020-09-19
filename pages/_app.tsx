import { useEffect } from 'react';
import { ApolloProvider, NormalizedCache } from '@apollo/client';
import { AppProps } from 'next/app';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useApollo } from '../components/apollo/client';
import Theme from '../components/theme';
import Head from 'next/head';



// This default export is required in a new `pages/_app.js` file.
export default function MyApp(props: AppProps<{ initialApolloState: NormalizedCache }>) {
  const myApolloClient = useApollo(props.pageProps.initialApolloState);

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  })

  return (<>
    <Head>
      <title>Wi-DAQ</title>
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
    </Head>
    <ApolloProvider client={myApolloClient}>
      <Theme>
        <CssBaseline />
        <props.Component {...props.pageProps} />
      </Theme>
    </ApolloProvider>
  </>);
}