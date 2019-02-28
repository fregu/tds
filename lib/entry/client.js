// @flow
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import routes from "../webpack/loaders/routes";
import App from "containers/App";
import createStore from "../store";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
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
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {}),
  headers: window.__GRAPHQL_TOKEN__
    ? { authorization: `Bearer ${window.__GRAPHQL_TOKEN__}` }
    : {}
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
          console.log("message", message);
        }
      } catch (err) {
        console.log("message", event.data);
      }
    };
    socket.send("Here's some text that the server is urgently awaiting!");
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
        <App routes={routes} />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
);

const rootEl = document.getElementById("root");

if (rootEl) {
  ReactDOM.hydrate(<Root />, rootEl);
}
