// @flow
import React, { type Node } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import createStore from "../../store";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import * as reducers from "../../webpack/loaders/reducers";
import * as middlewares from "../../webpack/loaders/middlewares";

import "../styleguide.css";

const store = createStore(window.__REDUX_STATE__ || {}, {
  reducers: { ...(reducers || {}) },
  middlewares: [...Object.values(middlewares || {})]
});

const client = new ApolloClient({
  uri: window.__GRAPHQL_ENDPOINT__,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
});
//
// // clean up globals
// delete window.__REDUX_STATE__
// delete window.__APOLLO_STATE__
// delete window.graphqlUrl
type Props = {
  children: Node
};
export default function Wrapper({ children }: Props) {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <BrowserRouter>{children}</BrowserRouter>
      </ApolloProvider>
    </Provider>
  );
}
