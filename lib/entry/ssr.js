import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { Switch, Route } from "react-router-dom";
import Helmet from "react-helmet";
import { Provider as ReduxProvider } from "react-redux";
import createStore from "../store";
import * as reducers from "../webpack/loaders/reducers";
import * as middlewares from "../webpack/loaders/middlewares";

import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider, renderToStringWithData } from "react-apollo";
import fetch from "node-fetch";
import App from "containers/App";
import htmlTemplate from "../server/htmlTemplate";

export default (config, html, ctx) => {
  const { graphql = {}, redux = {}, context = {}, server = {} } = config;
  console.log(server);
  const link = createHttpLink({
    uri: `${graphql.endpoint}`,
    fetch: (...args) => {
      return fetch(...args)
        .then(response => {
          console.log("fetch response", response);
          return response;
        })
        .catch(err => {
          console.error("fetch err", err);
        });
    }
  });

  // Get remote schema to allow for stitching

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: true
  });

  const store = createStore(
    { ...(redux.state || {}) },
    {
      reducers: { ...reducers },
      middlewares: [...Object.values(middlewares)]
    }
  );

  const Root = (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={ctx.originalUrl} context={ctx}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </ReduxProvider>
  );

  return renderToStringWithData(Root).then(content => {
    const reactDom = renderToString(Root);
    const reduxState = store.getState();
    const apolloState = apolloClient.extract();
    const helmetData = Helmet.renderStatic();

    // call template to render the HTML document
    return htmlTemplate(html, {
      reactDom,
      reduxState,
      apolloState,
      helmetData,
      graphql: {
        endpoint: graphql.endpoint
      },
      socket: {
        endpoint: server.socketEndpoint
      }
    });
  });
};
