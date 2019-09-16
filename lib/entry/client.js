// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from '../webpack/loaders/appEntry'
import createStore from '../store'
import googleTagManager from '../utils/gtag'
import { ApolloClient } from 'apollo-client'
import { onError } from 'apollo-link-error'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'

// import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'

import * as reducers from '../webpack/loaders/reduxReducers'
import * as middlewares from '../webpack/loaders/reduxMiddlewares'

const store = createStore(window.__REDUX_STATE__ || {}, {
  reducers: { ...(reducers || {}) },
  middlewares: [...Object.values(middlewares || {})]
})
const gtag = googleTagManager()

const client = new ApolloClient({
  defaultHttpLink: false,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {}),
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
    createUploadLink({
      uri:
        window.__GRAPHQL_ENDPOINT__ ||
        `${window.location.protocol}://${window.location.host}${
          window.__GRAPHQL_ENDPOINT__
        }`
    }),
    new HttpLink({
      uri: window.__GRAPHQL_ENDPOINT__,
      useGETForQueries:
        window.__CACHE_STRATEGY__ && window.__CACHE_STRATEGY__ !== 'networkOnly'
    })
  ])
})
if (window.__WEBSOCKET_ENDPOINT__) {
  var socket = new WebSocket(window.__WEBSOCKET_ENDPOINT__, 'clientSocket')

  socket.onopen = function(event) {
    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        if (message.type) {
          store.dispatch(message)
        } else {
          console.log('[TDS]', message)
        }
      } catch (err) {
        console.log('message', event.data)
      }
    }
  }
}
//
// // clean up globals
delete window.__REDUX_STATE__
delete window.__APOLLO_STATE__
delete window.__GRAPHQL_ENDPOINT__

// Enable dev mode hot module reloading
// const AppRoute = hmr(App);

const Root = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)

const rootEl = document.getElementById('root')

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl)
}
