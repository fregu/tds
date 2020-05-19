import React, { Fragment } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { Helmet } from 'react-helmet'
import { Provider as ReduxProvider } from 'react-redux'
import createStore from '../store'
import * as reducers from '../webpack/loaders/reduxReducers'
import * as middlewares from '../webpack/loaders/reduxMiddlewares'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'
import fetch from 'isomorphic-fetch'
import App from '../webpack/loaders/styleguideEntry'
import htmlTemplate from '../server/utils/htmlTemplate'

export default (config = {}, html, ctx) => {
  const {
    graphqlEndpoint,
    socketEndpoint,
    reduxState = {},
    title,
    external: { css: externalCSS = [], js: externalJS = [] } = {},
    meta = []
  } = config

  const link = createHttpLink({
    uri: graphqlEndpoint,
    fetch
  })

  // Get remote schema to allow for stitching

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: true
  })

  const store = createStore(reduxState, {
    reducers: { ...reducers },
    middlewares: [...Object.values(middlewares)]
  })

  const Root = (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={ctx.originalUrl} context={ctx}>
          <Fragment>
            <Helmet>
              {title ? <title>{title}</title> : null}
              {meta.map((meta, index) => (
                <meta {...meta} key={index} />
              ))}
              {externalCSS.map(url => (
                <link rel="stylesheet" key={url} href={url} />
              ))}
              {externalJS.map(({ type = 'text/javascript', src, async }) => (
                <script key={src} type={type} src={src} async={async} />
              ))}
            </Helmet>
            <App />
          </Fragment>
        </StaticRouter>
      </ApolloProvider>
    </ReduxProvider>
  )

  return renderToStringWithData(Root).then(content => {
    const reactDom = renderToString(Root)
    const reduxState = store.getState()
    const apolloState = apolloClient.extract()
    const helmetData = Helmet.renderStatic()

    // call template to render the HTML document
    return htmlTemplate(html, {
      reactDom,
      reduxState,
      apolloState,
      helmetData,
      graphql: {
        endpoint: graphqlEndpoint
      },
      socket: {
        endpoint: socketEndpoint
      }
    })
  })
}
