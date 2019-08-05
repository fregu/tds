import React, { Fragment } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import Helmet from 'react-helmet'
import { Provider as ReduxProvider } from 'react-redux'
import createStore from '../store'
import * as reducers from '../webpack/loaders/reducers'
import * as middlewares from '../webpack/loaders/middlewares'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'
import fetch from 'isomorphic-fetch'
import App from '../webpack/loaders/styleguideEntry'
import htmlTemplate from '../server/utils/htmlTemplate'

export default (config, html, ctx) => {
  const {
    graphql = {},
    redux = {},
    server = {},
    title,
    analytics: { key: analyticsKey } = {},
    applicationInsights: { key: appInsightsKey } = {},
    external: { css: externalCSS = [], js: externalJS = [] } = {},
    meta = []
  } = config
  const link = createHttpLink({
    uri: `${graphql.endpoint}`,
    fetch
  })

  // Get remote schema to allow for stitching

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: true
  })

  const store = createStore(
    { ...(redux.state || {}) },
    {
      reducers: { ...reducers },
      middlewares: [...Object.values(middlewares)]
    }
  )
  const Root = (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={ctx.originalUrl} context={ctx}>
          <Fragment>
            <Helmet>
              {title ? <title>{title}</title> : null}
              {meta.map((meta, index) => (
                <meta key={index} {...meta} />
              ))}
              {externalCSS.map((url, index) => (
                <link key={index} rel="stylesheet" href={url} />
              ))}
              {analyticsKey ? (
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${analyticsKey}`}
                />
              ) : null}
              {appInsightsKey ? (
                <script>{`var appInsights=window.appInsights||function(a){
                function b(a){c[a]=function(){var b=arguments;c.queue.push(function(){c[a].apply(c,b)})}}var c={config:a},d=document,e=window;setTimeout(function(){var b=d.createElement("script");b.src=a.url||"https://az416426.vo.msecnd.net/scripts/a/ai.0.js",d.getElementsByTagName("script")[0].parentNode.appendChild(b)});try{c.cookie=d.cookie}catch(a){}c.queue=[];for(var f=["Event","Exception","Metric","PageView","Trace","Dependency"];f.length;)b("track"+f.pop());if(b("setAuthenticatedUserContext"),b("clearAuthenticatedUserContext"),b("startTrackEvent"),b("stopTrackEvent"),b("startTrackPage"),b("stopTrackPage"),b("flush"),!a.disableExceptionTracking){f="onerror",b("_"+f);var g=e[f];e[f]=function(a,b,d,e,h){var i=g&&g(a,b,d,e,h);return!0!==i&&c["_"+f](a,b,d,e,h),i}}return c
                }({
                    instrumentationKey: "${appInsightsKey}"
                });

              window.appInsights=appInsights,appInsights.queue&&0===appInsights.queue.length&&appInsights.trackPageView();`}</script>
              ) : null}
              {externalJS.map(
                ({ type = 'text/javascript', src, async }, index) => (
                  <script key={index} type={type} src={src} async={async} />
                )
              )}
              {config.cacheStrategy &&
              config.cacheStrategy !== 'networkOnly' &&
              config.mode === 'production' ? (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                      navigator.serviceWorker.register('/service-worker.js').then(registration => {
                        console.log('SW registered: ', registration);
                      }).catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                      });
                    });
                  }
                `
                  }}
                />
              ) : null}
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
        endpoint: graphql.endpoint
      },
      socket: {
        endpoint: server.socketEndpoint
      }
    })
  })
}
