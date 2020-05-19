// @flow
import React, { type Node } from 'react'
import { Provider } from '../../webpack/loaders/reactReduxLoader'
import { BrowserRouter } from '../../webpack/loaders/reactRouterDomLoader'

import createStore from '../../store'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink
} from '@apollo/client'
import { ApolloProvider as ApolloComponentProvider } from '@apollo/react-components'

import * as reducers from '../../webpack/loaders/reduxReducers'
import * as middlewares from '../../webpack/loaders/reduxMiddlewares'
import Layout from 'ui/containers/Layout'
// TODO: import "../../webpack/loaders/baseCss"
import '../styleguide.css'

const store = createStore(window.__REDUX_STATE__ || {}, {
  reducers: { ...(reducers || {}) },
  middlewares: [...Object.values(middlewares || {})]
})

const httpLink = new HttpLink({
  uri: window.__GRAPHQL_ENDPOINT__,
  credentials: 'same-origin',
  useGETForQueries:
    window.__CACHE_STRATEGY__ && window.__CACHE_STRATEGY__ !== 'networkOnly'
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
})
//
// // clean up globals
// delete window.__REDUX_STATE__
// delete window.__APOLLO_STATE__
// delete window.graphqlUrl
type Props = {
  children: Node
}
export default function Wrapper({ children }: Props) {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <ApolloComponentProvider client={client}>
          <BrowserRouter>
            <Layout>{children}</Layout>
          </BrowserRouter>
        </ApolloComponentProvider>
      </ApolloProvider>
    </Provider>
  )
}
