const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const fs = require('fs')
const historyFallback = require('koa2-history-api-fallback')
const serve = require('koa-static')
const mount = require('koa-mount')
const websockify = require('koa-websocket')
const session = require('koa-session')
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const helmet = require('koa-helmet')
const { ApolloServer } = require('apollo-server-koa')
const mime = require('mime-types')

const createGraphQLSchema = require('./utils/createGraphQLSchema')
const errorHandler = require('./middlewares/errorHandler')
// const broadcaster = require('./utils/broadcaster')

// const ssr = require('./utils/ssr')
// const styleguide = require('./utils/styleguide')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
const requestContentFromFileSystem = require('./utils/requestContentFromFileSystem')

let activeServer

async function createServer({
  app: currentApp,
  currentServer,
  context: configContext,
  htmlTemplate,
  fileSystem = fs,
  isBuilding = false,
  mode = 'production',
  keys: {
    analytics: analyticsKey,
    applicationInsights: applicationInsightsKey,
    tagManager: tagManagerKey
  } = {},
  auth: { password: authPassword } = {},
  server: {
    publicPath = '/',
    host = 'localhost',
    protocol = 'http',
    port = 4000,
    middlewares: serverMiddlewares,
    sessionKey = 'super secret key',
    errorHandler: configErrorHandler
  },
  paths: { dist: distPath = 'dist' } = {},
  graphql: {
    resolvers,
    typeDefs,
    schema,
    endpoint: graphqlEndpoint = '/graphql',
    remoteSchemas
  } = {},
  ssrRender,
  styleguideSsrRender,
  styleguide,
  assets,
  title,
  description,
  cacheStrategy
}) {
  if (currentServer) {
    activeServer = currentServer
  }

  const middlewares = serverMiddlewares
    ? serverMiddlewares.map(middleware => {
        return typeof middleware === 'string' ? require(middleware) : middleware
      })
    : []

  const app = websockify(currentApp || new Koa())
  const isDev = mode === 'development'
  const router = new Router()
  const distAssetsFile = requestContentFromFileSystem(
    path.resolve(distPath, 'assets.json'),
    fileSystem
  )
  const distAssets =
    typeof distAssetsFile === 'string'
      ? JSON.parse(distAssetsFile)
      : distAssetsFile || []

  const context = {
    ssrRender:
      ssrRender ||
      requestModuleFromFileSystem(path.resolve(distPath, 'ssr.js'), fileSystem)
        .default,
    styleguideSsrRender:
      styleguideSsrRender ||
      requestModuleFromFileSystem(
        path.resolve(distPath, 'styleguide_ssr.js'),
        fileSystem
      ).default,
    htmlTemplate:
      htmlTemplate ||
      requestContentFromFileSystem(
        path.resolve(distPath, 'index.html'),
        fileSystem
      ),
    styleguideTemplate:
      htmlTemplate ||
      requestContentFromFileSystem(
        path.resolve(distPath, 'styleguide.html'),
        fileSystem
      ),
    assets: assets || distAssets || []
  }

  let notReadyBrowser = isBuilding
  let broadcaster = () => {}

  app.keys = [sessionKey]
  const sessionConfig = {
    key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
    maxAge: 86400000 /** (number || 'session') maxAge in ms (default is 1 days) */,
    signed: true /** (boolean) signed or not (default true) */,
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
  }
  app.use(session(sessionConfig, app))

  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      console.log('ERROR', e)
    }
  })

  app.use(bodyParser())
  app.use(cors())

  app.use(router.routes()).use(router.allowedMethods())
  if (!isDev) {
    app.use(compress())
    app.use(helmet())
  }

  const waitForIt = () =>
    new Promise((resolve, reject) => {
      let notReadyInterval
      notReadyInterval = setInterval(() => {
        if (!notReadyBrowser) {
          clearInterval(notReadyInterval)
          resolve(true)
        }
      }, 500)
    })

  app.ws.use(function(ctx, next) {
    ctx.websocket.send('[TDS] Socket ready')
    ctx.websocket.on('message', function(message) {
      // do something with the message from client
      console.log(message)
    })
    broadcaster = message => {
      try {
        ctx.websocket.send(
          typeof message !== 'string' ? JSON.stringify(message) : message
        )
      } catch (err) {
        console.error('Could not connect to client via webSockets', err)
      }
    }

    return next()
  })

  app.use(
    errorHandler({
      errorHandler: configErrorHandler,
      keys: { applicationInsights: applicationInsightsKey },
      server: { host, port, publicPath }
    })
  )

  const graphQLSchema = await createGraphQLSchema({
    resolvers,
    typeDefs,
    remoteSchemas,
    schema
  })

  if (graphQLSchema) {
    const apollo = new ApolloServer({
      schema: graphQLSchema,
      context: ({ ctx }) => ctx,
      formatError: error => {
        console.log('formatError', error)
        return error
      },
      introspection: true,
      playground: true
    })
    apollo.applyMiddleware({ app, path: graphqlEndpoint })
  }

  middlewares.forEach(middleware => {
    app.use(middleware)
  })

  app.use((ctx, next) => {
    const assetMatch = context.assets.find(
      a => ctx.path === `${publicPath}${a}`
    )
    if (
      assetMatch &&
      (ctx.path !== `${publicPath}index.html` || !context.ssrRender)
    ) {
      ctx.status = 200
      ctx.type = mime.contentType(assetMatch)
      ctx.body = fileSystem.readFileSync(path.resolve(distPath, assetMatch))
      return
    }
    return next()
  })

  app.use(async (ctx, next) => {
    if (notReadyBrowser) {
      console.log('Wait until bundle is ready')
      await waitForIt()
    }
    return next()
  })

  app.use((ctx, next) => {
    if (
      !isDev &&
      authPassword &&
      (!ctx.session.password || ctx.session.password !== authPassword)
    ) {
      if (
        ctx.request.body &&
        ctx.request.body.tdsPassword &&
        ctx.request.body.tdsPassword === authPassword
      ) {
        ctx.session.password = ctx.request.body.tdsPassword
      } else {
        ctx.status = 200
        ctx.type = 'text/html'
        ctx.body =
          '<html><body><h1>You need to log in to the application</h1><form method="post"><input type="password" name="tdsPassword" /><button type="submit">Log in</button></form></body></html>'
        return false
      }
    }
    return next()
  })

  // only look for static build of styleguide in filesystem/dist/styleguide.html

  app.use(async (ctx, next) => {
    if (
      ctx.path === `${publicPath}styleguidestyleguide/index.html` ||
      (ctx.path === `${publicPath}styleguide` &&
        context.styleguideSsrRender &&
        context.styleguideTemplate)
    ) {
      ctx.type = 'text/html'
      ctx.status = 200
      ctx.body = await context.styleguideSsrRender(
        {
          graphqlEndpoint: graphqlEndpoint,
          port,
          socketEndpoint: `${protocol === 'https' ? 'wss' : 'ws'}://${host}${
            port ? `:${port}` : ''
          }`,
          reduxState: {}
        },
        context.styleguideTemplate,
        ctx
      )
      return
    }
    return next()
  })

  app.use(historyFallback())
  app.use(async (ctx, next) => {
    if (
      ctx.path === `${publicPath}index.html` ||
      (ctx.path === publicPath && context.ssrRender)
    ) {
      ctx.type = 'text/html'
      ctx.status = 200
      ctx.body = await context.ssrRender(
        {
          title,
          description,
          mode,
          cacheStrategy,
          keys: {
            analytics: analyticsKey,
            applicationinsights: applicationInsightsKey
          },
          graphqlEndpoint: graphqlEndpoint,
          port,
          socketEndpoint: `${protocol === 'https' ? 'wss' : 'ws'}://${host}${
            port ? `:${port}` : ''
          }`,
          reduxState: {},
          globals: ctx.windowGlobal
        },
        context.htmlTemplate,
        ctx
      )
      return
    }
    return next()
  })

  // Serve real files from dist folder
  app.use(mount(publicPath, serve(distPath)))
  // start server
  if (activeServer) {
    activeServer.close()
  }
  activeServer = app.listen(port, () => {
    console.log(
      `Server listening on ${protocol}://${host}${port ? `:${port}` : ''}`
    )
  })

  return {
    ready() {
      console.log('isReady')
      notReadyBrowser = false
    },
    restart(config) {
      console.log('restart with new config')

      // return createServer({
      //   app,
      //   currentServer: activeServer,
      //   context: configContext,
      //   ...config
      // })
      // kill and restart
    },
    kill() {
      console.log('closing down server')
      activeServer.close()
    },
    reload() {
      broadcaster({ action: 'TDS_CLIENT_RELOAD' })
    },

    async update(buildAssets) {
      console.log('update server with assets', buildAssets)
      context.assets = [...new Set([...(context.assets || []), ...buildAssets])]

      if (buildAssets.includes('index.html')) {
        context.htmlTemplate = await fileSystem.readFileSync(
          path.resolve(distPath, 'index.html'),
          'utf-8'
        )
      }
      if (buildAssets.includes('styleguide.html')) {
        context.styleguideTemplate = await fileSystem.readFileSync(
          path.resolve(distPath, 'styleguide.html'),
          'utf-8'
        )
      }
      if (buildAssets.includes('ssr.js')) {
        context.ssrRender = await requestModuleFromFileSystem(
          path.resolve(distPath, 'ssr.js'),
          fileSystem
        ).default
      }
      if (buildAssets.includes('styleguide_ssr.js')) {
        context.styleguideSsrRender = await requestModuleFromFileSystem(
          path.resolve(distPath, 'styleguide_ssr.js'),
          fileSystem
        ).default
      }

      if (!notReadyBrowser) {
        if (buildAssets.includes('ssr.js')) {
          broadcaster({ type: 'TDS_CLIENT_RELOAD' })
        } else if (
          buildAssets.find(file => file.match(/\.(s?css|styl|less)$/))
        ) {
          broadcaster({ type: 'TDS_CLIENT_UPDATE_STYLE' })
        }
      }
    }
  }
}

module.exports = createServer
