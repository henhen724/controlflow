import { useMemo } from 'react';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache, NormalizedCache, NormalizedCacheObject } from 'apollo-cache-inmemory';

let apolloClient: ApolloClient<NormalizedCacheObject>;

const PORT = process.env.PORT || "3000";

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('apollo-link-schema');
    const { schema } = require('./schema');
    return new SchemaLink({ schema });
  } else {
    const { HttpLink } = require('apollo-link-http');
    const { WebSocketLink } = require('apollo-link-ws');
    const { SubscriptionClient } = require('subscriptions-transport-ws');
    const httpLink = new HttpLink({
      uri: '/graphql',
      credentials: 'same-origin',
    });
    const WEBSOCKET_URI = process.env.NODE_ENV === 'production' ? `wss://${window.location.host}/graphql` : `ws://${window.location.host}/graphql`;
    console.log(WEBSOCKET_URI);
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

export function initializeApollo(initialState: undefined | NormalizedCache) {
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
