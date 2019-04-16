import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "../webpack/loaders/reactRouterLoader";
import Helmet from "react-helmet";
import { Provider as ReduxProvider } from "../webpack/loaders/reactReduxLoader";
import createStore from "../store";
import * as reducers from "../webpack/loaders/reducers";
import * as middlewares from "../webpack/loaders/middlewares";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  ApolloProvider,
  renderToStringWithData
} from "../webpack/loaders/reactApolloLoader";
import fetch from "node-fetch";
import App from "../webpack/loaders/appEntry";
import htmlTemplate from "../server/htmlTemplate";

export default (config, html, ctx) => {
  const { graphql = {}, redux = {}, context = {}, server = {} } = config;
  const link = createHttpLink({
    uri: `${graphql.endpoint}`,
    fetch
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
