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

async function createServer({
  app: currentApp,
  context: configContext,
  htmlTemplate,
  fileSystem = fs,
  isBuilding = false,
  mode = 'production',
  keys = {},
  server: {
    publicPath = '/',
    host,
    port,
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
  styleguide,
  assets
}) {
  const middlewares = serverMiddlewares
    ? Object.keys(serverMiddlewares).map(key => serverMiddlewares[key])
    : []

  const app = websockify(currentApp || new Koa())
  const isDev = mode === 'development'
  const router = new Router()
  const distAssetsFile = requestContentFromFileSystem(
    path.resolve(distPath, 'assets.json'),
    fileSystem
  )
  console.log(distAssetsFile, typeof distAssetsFile)
  const distAssets =
    typeof distAssetsFile === 'string'
      ? JSON.parse(distAssetsFile)
      : distAssetsFile || []

  const context = {
    ssrRender:
      ssrRender ||
      requestModuleFromFileSystem(path.resolve(distPath, 'ssr.js'), fileSystem)
        .default,
    styleguide:
      styleguide ||
      requestModuleFromFileSystem(
        path.resolve(distPath, 'styleguide.js'),
        fileSystem
      ).default,
    htmlTemplate:
      htmlTemplate ||
      requestContentFromFileSystem(
        path.resolve(distPath, 'index.html'),
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
      keys,
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

  middlewares.forEach(filePath => {
    const middleware = require(filePath)
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

  app.use(historyFallback())

  app.use(async (ctx, next) => {
    if (ctx.path === `${publicPath}index.html` && context.ssrRender) {
      ctx.type = 'text/html'
      ctx.status = 200
      ctx.body = await context.ssrRender(
        {
          graphqlEndpoint: `http://${host}${
            port ? `:${port}` : ''
          }${graphqlEndpoint}`,
          socketEndpoint: `ws://${host}${port ? `:${port}` : ''}`,
          reduxState: {}
        },
        context.htmlTemplate,
        ctx
      )
    }
  })

  // Serve real files from dist folder
  app.use(mount(publicPath, serve(distPath)))
  // start server

  if (!currentApp) {
    app.listen(port, () => {
      console.log(`Server listening on http://${host}${port ? `:${port}` : ''}`)
    })
  }

  return {
    ready() {
      console.log('isReady')
      notReadyBrowser = false
    },
    restart(config) {
      console.log('restart with new configs', config)
      // kill and restart
    },
    reload() {
      broadcaster({ action: 'TDS_CLIENT_RELOAD' })
    },
    async update(buildAssets) {
      context.assets = [...new Set([...(context.assets || []), ...buildAssets])]

      if (buildAssets.includes('index.html')) {
        context.htmlTemplate = await fileSystem.readFileSync(
          path.resolve(distPath, 'index.html'),
          'utf-8'
        )
      }
      if (buildAssets.includes('ssr.js')) {
        context.ssrRender = await requestModuleFromFileSystem(
          path.resolve(distPath, 'ssr.js'),
          fileSystem
        ).default
      }
      if (buildAssets.includes('styleguide.js')) {
        context.styleguide = await requestModuleFromFileSystem(
          path.resolve(distPath, 'styleguide.js'),
          fileSystem,
          true
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
