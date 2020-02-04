import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import Helmet from 'react-helmet'
import { Provider as ReduxProvider } from 'react-redux'
import createStore from '../store'
import * as reducers from '../webpack/loaders/reduxReducers'
import * as middlewares from '../webpack/loaders/reduxMiddlewares'
import TediousProvider from './tds'

import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache
} from '@apollo/client'

import { ApolloProvider as ApolloComponentProvider } from '@apollo/react-components'

// import { createHttpLink } from 'apollo-link-http'
// import { InMemoryCache } from 'apollo-cache-inmemory'
import { renderToStringWithData } from '@apollo/react-ssr'
import fetch from 'isomorphic-fetch'
import App from '../webpack/loaders/appEntry'
import htmlTemplate from '../server/utils/htmlTemplate'

export default (config = {}, html, ctx) => {
  const {
    mode = 'development',
    graphqlEndpoint,
    socketEndpoint,
    reduxState = {},
    port,
    title,
    enableSSR,
    keys: {
      analytics: analyticsKey,
      applicationinsights: applicationInsightsKey,
      tagManager: tagManagerKey
    } = {},
    external: { css: externalCSS = [], js: externalJS = [] } = {},
    meta = [],
    description,
    cacheStrategy,
    globals = {}
  } = config

  const link = createHttpLink({
    uri: `http://127.0.0.1${port ? `:${port}` : ''}${graphqlEndpoint}`,
    fetch: (url, params) =>
      fetch(url, {
        ...params,
        headers: { ...params.headers, cookie: ctx.request.headers.cookie }
      }),
    credentials: 'same-origin'
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: true
  })

  const store = createStore(reduxState, {
    reducers: { ...reducers },
    middlewares: [...Object.values(middlewares)]
  })
  const helmet = (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {title ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.__APP_NAME__ = "${title}";
        `
          }}
        />
      ) : null}
      {meta.map((meta, index) => (
        <meta {...meta} key={index} />
      ))}
      {externalCSS.map(url => (
        <link rel="stylesheet" key={url} href={url} />
      ))}
      {description ? <meta name="description" content={description} /> : null}
      {analyticsKey ? (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsKey}`}
        />
      ) : null}
      {analyticsKey ? (
        <script>
          {`window.__DOCUMENT_LOAD_TIME__ = new Date();
          window.__GOOGLE_ANALYTICS_KEY__ = "${analyticsKey}";

          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsKey}');

        `}
        </script>
      ) : null}
      {tagManagerKey ? (
        <script>
          {`
        window.__DOCUMENT_LOAD_TIME__ = new Date();
        window.__GOOGLE_TAG_MANAGER_KEY__ = "${tagManagerKey}";
        <!-- Google Tag Manager -->
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${tagManagerKey}');
        <!-- End Google Tag Manager -->
    `}
        </script>
      ) : null}
      {applicationInsightsKey ? (
        <script>{`var appInsights=window.appInsights||function(a){
      function b(a){c[a]=function(){var b=arguments;c.queue.push(function(){c[a].apply(c,b)})}}var c={config:a},d=document,e=window;setTimeout(function(){var b=d.createElement("script");b.src=a.url||"https://az416426.vo.msecnd.net/scripts/a/ai.0.js",d.getElementsByTagName("script")[0].parentNode.appendChild(b)});try{c.cookie=d.cookie}catch(a){}c.queue=[];for(var f=["Event","Exception","Metric","PageView","Trace","Dependency"];f.length;)b("track"+f.pop());if(b("setAuthenticatedUserContext"),b("clearAuthenticatedUserContext"),b("startTrackEvent"),b("stopTrackEvent"),b("startTrackPage"),b("stopTrackPage"),b("flush"),!a.disableExceptionTracking){f="onerror",b("_"+f);var g=e[f];e[f]=function(a,b,d,e,h){var i=g&&g(a,b,d,e,h);return!0!==i&&c["_"+f](a,b,d,e,h),i}}return c
      }({
          instrumentationKey: "${applicationInsightsKey}"
      });

    window.appInsights=appInsights,appInsights.queue&&0===appInsights.queue.length&&appInsights.trackPageView();`}</script>
      ) : null}

      {externalJS.map(({ type = 'text/javascript', src, async }) => (
        <script key={src} type={type} src={src} async={async} />
      ))}

      {cacheStrategy &&
      cacheStrategy !== 'networkOnly' &&
      mode === 'production' ? (
        <script>
          {`
        if ('serviceWorker' in navigator) {
          window.__CACHE_STRATEGY__ = "${cacheStrategy}";

          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
              console.log('SW registered: ', registration);
            }).catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
            });
          });
        }
      `}
        </script>
      ) : cacheStrategy && cacheStrategy === 'networkOnly' ? (
        `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister()
          }
        }).catch(function(err) {
          console.log('Service Worker registration failed: ', err);
        });
      }
      `
      ) : null}
    </Helmet>
  )
  const Root = (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <ApolloComponentProvider client={client}>
          <StaticRouter location={ctx.originalUrl} context={ctx}>
            <TediousProvider>
              {helmet}
              <App />
            </TediousProvider>
          </StaticRouter>
        </ApolloComponentProvider>
      </ApolloProvider>
    </ReduxProvider>
  )

  return renderToStringWithData(Root).then(content => {
    const reactDom = renderToString(enableSSR ? Root : helmet)
    const reduxState = enableSSR ? store.getState() : {}
    const apolloState = enableSSR ? client.extract() : {}
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
      },
      globals
    })
  })
}
