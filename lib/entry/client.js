// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from '../webpack/loaders/appEntry'
import createStore from '../store'
import TediousProvider from './tds'
import googleTagManager from '../utils/gtag'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink
} from '@apollo/client'
import { ApolloProvider as ApolloComponentProvider } from '@apollo/react-components'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import * as reducers from '../webpack/loaders/reduxReducers'
import * as middlewares from '../webpack/loaders/reduxMiddlewares'
import * as Sentry from '@sentry/browser';

const store = createStore(
  JSON.parse(decodeURIComponent(window.__REDUX_STATE__ || '{}')),
  {
    reducers: { ...(reducers || {}) },
    middlewares: [...Object.values(middlewares || {})]
  }
)
const gtag = googleTagManager()

const wsLink = new WebSocketLink({
  uri: window.__WEBSOCKET_ENDPOINT__,
  options: {
    reconnect: true
  }
})
const httpLink = new HttpLink({
  uri: window.__GRAPHQL_ENDPOINT__,
  credentials: 'same-origin',
  useGETForQueries:
    window.__CACHE_STRATEGY__ && window.__CACHE_STRATEGY__ !== 'networkOnly'
})

const client = new ApolloClient({
  // defaultHttpLink: false,
  cache: new InMemoryCache().restore(
    JSON.parse(decodeURIComponent(window.__APOLLO_STATE__ || '{}'))
  ),
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
          const errMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          gtag.error({
            description: errMessage
          })
          console.error(errMessage)
        })
      }
      if (networkError) {
        const errMessage = `[Network error]: ${networkError}`
        gtag.error({
          description: errMessage
        })
        console.error(errMessage)
      }
    }),
    split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        )
      },
      wsLink,
      httpLink
    )
  ])
})
if (window.__SENTRY_KEY__) {
  Sentry.init({dsn: window.__SENTRY_KEY__});
}

// // clean up globals
delete window.__REDUX_STATE__
delete window.__APOLLO_STATE__
delete window.__GRAPHQL_ENDPOINT__

// Enable dev mode hot module reloading
// const AppRoute = hmr(App);

const Root = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <ApolloComponentProvider client={client}>
        <BrowserRouter>
          <TediousProvider>
            <App />
          </TediousProvider>
        </BrowserRouter>
      </ApolloComponentProvider>
    </ApolloProvider>
  </Provider>
)

const rootEl = document.getElementById('root')

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl)
}
