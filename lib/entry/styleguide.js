// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import components from '../webpack/loaders/components'

import Styleguide from '../styleguide'
import createStore from '../store'
// import ApolloClient from 'apollo-boost'
// import { ApolloProvider } from 'react-apollo'
// import { InMemoryCache } from 'apollo-cache-inmemory'
//

const store = createStore(window.__REDUX_STATE__ || {})
//
// const client = new ApolloClient({
//   uri: window.graphqlUrl || 'http://localhost:5500/graphql',
//   cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
// })
//
// // clean up globals
// delete window.__REDUX_STATE__
// delete window.__APOLLO_STATE__
// delete window.graphqlUrl

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Styleguide components={components} />
    </BrowserRouter>
  </Provider>
)

const rootEl = document.getElementById('app')

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl)
}
