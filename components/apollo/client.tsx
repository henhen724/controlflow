import { useMemo } from 'react';
import { ApolloClient, ApolloLink, split, InMemoryCache, NormalizedCache, NormalizedCacheObject, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

let apolloClient: ApolloClient<NormalizedCacheObject>;

const PORT = process.env.PORT || "3000";

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema');
    const { schema } = require('../../server/apollo/schema');
    return new SchemaLink({ schema });
  } else {
    const httpLink = new HttpLink({
      uri: '/graphql',
      credentials: 'same-origin',
    });
    const WEBSOCKET_URI = process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost' ? `wss://${window.location.host}/graphql` : `ws://${window.location.host}/graphql`;
    const wsLink = new WebSocketLink({
      uri: WEBSOCKET_URI,
      options: {
        reconnect: true,
      }
    });
    const termLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    )
    return ApolloLink.from([termLink]);
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(initialState?: NormalizedCache) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState.toObject())
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function useApollo(initialState: undefined | NormalizedCache) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
