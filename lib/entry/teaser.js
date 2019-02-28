// @flow
import React from 'react'
import ReactDOM from 'react-dom'

import AppTeaser from 'containers/AppTeaser'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'

const client = new ApolloClient({
  uri: window.__GRAPHQL_ENDPOINT__ || 'http://localhost:8081/graphql',
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {}),
  headers: window.__RB_TOKEN__
    ? { authorization: `Bearer ${window.__RB_TOKEN__}` }
    : {}
})

const Root = () => (
  <ApolloProvider client={client}>
    <AppTeaser />
  </ApolloProvider>
)

const rootEl = document.getElementById('app-teaser')

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl)
}
