// @flow
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "../webpack/loaders/reactReduxLoader";
import { BrowserRouter } from "../webpack/loaders/reactRouterDomLoader";

import App from "../webpack/loaders/appEntry";
import createStore from "../store";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "../webpack/loaders/reactApolloLoader";
import { InMemoryCache } from "apollo-cache-inmemory";
import config from "../webpack/loaders/config";
// import { hot as hmr } from "react-hot-loader/root";
import * as reducers from "../webpack/loaders/reducers";
import * as middlewares from "../webpack/loaders/middlewares";

const store = createStore(window.__REDUX_STATE__ || {}, {
  reducers: { ...(reducers || {}) },
  middlewares: [...Object.values(middlewares || {})]
});

const client = new ApolloClient({
  uri: window.__GRAPHQL_ENDPOINT__ || "http://localhost:8081/graphql",
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
});
if (window.__WEBSOCKET_ENDPOINT__) {
  var socket = new WebSocket(window.__WEBSOCKET_ENDPOINT__, "clientSocket");

  socket.onopen = function(event) {
    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        if (message.type) {
          store.dispatch(message);
        } else {
          console.log("[TDS]", message);
        }
      } catch (err) {
        console.log("message", event.data);
      }
    };
  };
}
//
// // clean up globals
delete window.__REDUX_STATE__;
delete window.__APOLLO_STATE__;
delete window.graphqlUrl;

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
);

const rootEl = document.getElementById("root");

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl);
}
