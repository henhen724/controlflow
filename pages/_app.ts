import { ApolloProvider } from '@apollo/react-hooks';
import { useApollo } from '../apollo/client';

import '../css/index.scss'

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const myApolloClient = useApollo(pageProps.initialApolloState);

  return (<(ApolloProvider: ApolloProvider) client = { myApolloClient } >
    <Component { ...pageProps } />
    </ApolloProvider>);
}