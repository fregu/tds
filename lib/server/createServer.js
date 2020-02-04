const Koa = require('koa')
const Router = require('koa-router')

const path = require('path')
const fs = require('fs-extra')
const historyFallback = require('koa2-history-api-fallback')
const serve = require('koa-static')
const mount = require('koa-mount')
const session = require('koa-session')
const pubsub = require('./utils/pubsub')
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const helmet = require('koa-helmet')
const { ApolloServer } = require('apollo-server-koa')
const mime = require('mime-types')

const createGraphQLSchema = require('./utils/createGraphQLSchema')
const errorHandler = require('./middlewares/errorHandler')

const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
const requestContentFromFileSystem = require('./utils/requestContentFromFileSystem')

let server
const broadcaster = message => {
  pubsub.publish('TDS_UPDATE', { tds: message })
}
async function createServer(
  {
    context: configContext,
    htmlTemplate,
    fileSystem = fs,
    isBuilding = false,
    mode = 'production',
    keys,
    auth: { password: authPassword } = {},
    server: {
      publicPath = '/',
      host = 'localhost',
      protocol = 'http',
      port = 4000,
      middlewares: serverMiddlewares,
      sessionKey = 'super secret key',
      errorHandler: configErrorHandler,
      cron: cronFile
    } = {},
    ssr: enableSSR = true,
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
  },
  callback
) {
  const middlewares = serverMiddlewares
    ? serverMiddlewares.map(middleware => {
        return typeof middleware === 'string' ? require(middleware) : middleware
      })
    : []

  const app = new Koa() // websockify(new Koa())
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
        path.resolve(distPath, 'public/index.html'),
        fileSystem
      ),
    styleguideTemplate:
      htmlTemplate ||
      requestContentFromFileSystem(
        path.resolve(distPath, 'public/styleguide.html'),
        fileSystem
      ),
    assets: assets || distAssets || [],
    graphQLSchema: await createGraphQLSchema({
      resolvers,
      typeDefs,
      remoteSchemas,
      schema
    }),
    middlewares
  }

  if (cronFile) {
    const cron = require('node-cron')
    const cronJobs = require(cronFile)
    console.log(
      'cronJobs',
      typeof cronJobs === 'object' && Object.keys(cronJobs).length
    )
    if (typeof cronJobs === 'object' && Object.keys(cronJobs).length) {
      Object.keys(cronJobs).forEach(tab => cron.schedule(tab, cronJobs[tab]))
    }
  }

  let notReadyBrowser = isBuilding

  app.keys = [sessionKey]
  const sessionConfig = {
    key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
    maxAge: 86400000 /** (number || 'session') maxAge in ms (default is 1 days) */,
    signed: true /** (boolean) signed or not (default true) */,
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
  }

  const httpServer = app.listen(port, () => {
    console.log(
      `Server listening hard on ${protocol}://${host}${port ? `:${port}` : ''}`
    )
  })

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
      const notReadyInterval = setInterval(() => {
        if (!notReadyBrowser) {
          clearInterval(notReadyInterval)
          resolve(true)
        }
      }, 500)
    })

  // Serve assets
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
      ctx.body = fileSystem.readFileSync(
        path.resolve(distPath, 'public', assetMatch)
      )
      return
    }
    return next()
  })

  context.middlewares.forEach(middleware => {
    app.use(middleware)
  })

  app.use(
    errorHandler({
      errorHandler: configErrorHandler,
      keys: { applicationInsights: keys && keys.applicationInsights },
      server: { host, port, publicPath }
    })
  )

  const apollo = new ApolloServer({
    schema: context.graphQLSchema,
    context: ({ ctx }) => ctx,
    formatError: error => {
      console.log('formatError', error)
      return error
    },
    introspection: true,
    playground: isDev && {
      settings: {
        'request.credentials': 'same-origin'
      }
    }
  })

  apollo.applyMiddleware({ app, path: graphqlEndpoint })
  apollo.installSubscriptionHandlers(httpServer)

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

  app.use(async (ctx, next) => {
    if (
      ctx.path.match(/styleguide/) &&
      context.styleguideSsrRender &&
      context.styleguideTemplate
    ) {
      ctx.type = 'text/html'
      ctx.status = 200
      ctx.body = await context.styleguideSsrRender(
        {
          graphqlEndpoint: graphqlEndpoint,
          port,
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
          enableSSR,
          keys,
          graphqlEndpoint: graphqlEndpoint,
          graphqlSchema: context.graphQLSchema,
          port,
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
  app.use(mount(publicPath, serve(path.resolve(distPath, 'public'))))

  const activeServer = {
    app,
    broadcast(message) {
      broadcaster(message)
    },
    ready() {
      console.log(
        `Application is ready and running on ${protocol}://${host}${
          port ? `:${port}` : ''
        }`
      )
      notReadyBrowser = false
    },
    replaceWith(app) {
      return server.update(app)
    },
    restart(config) {
      console.log('restart with new config')
    },
    reload() {
      // activeServer.broadcast({ type: 'TDS_CLIENT_RELOAD' })
      activeServer.broadcast({ reload: true })
    },

    async update(buildAssets = []) {
      context.assets = [...new Set([...(context.assets || []), ...buildAssets])]

      if (buildAssets.includes('index.html')) {
        context.htmlTemplate = await fileSystem.readFileSync(
          path.resolve(distPath, 'public', 'index.html'),
          'utf-8'
        )
      }
      if (buildAssets.includes('styleguide.html')) {
        context.styleguideTemplate = await fileSystem.readFileSync(
          path.resolve(distPath, 'public', 'styleguide.html'),
          'utf-8'
        )
      }
      if (buildAssets.includes('ssr.js')) {
        context.ssrRender = await requestModuleFromFileSystem(
          path.resolve(distPath, 'ssr.js'),
          fileSystem,
          true
        ).default
      }

      if (buildAssets.includes('styleguide_ssr.js')) {
        context.styleguideSsrRender = await requestModuleFromFileSystem(
          path.resolve(distPath, 'styleguide_ssr.js'),
          fileSystem
        ).default
      }

      if (buildAssets.includes('server.js')) {
        const {
          // default: startServer,
          config: serverConfig
        } = await requestModuleFromFileSystem(
          path.resolve(distPath, 'server.js'),
          fileSystem,
          true
        )
        if (serverConfig.graphql) {
          const {
            resolvers,
            typeDefs,
            remoteSchemas,
            schema
          } = serverConfig.graphql

          try {
            const graphQLSchema = await createGraphQLSchema({
              resolvers,
              typeDefs,
              remoteSchemas,
              schema
            })
            console.log('update with new graphQLSchema')

            context.graphQLSchema = graphQLSchema
          } catch (err) {
            console.error('Could not create GraphQLSchema', err)
          }
          notReadyBrowser = false
          context.middlewares = serverConfig.server.middlewares
        } else {
          notReadyBrowser = false
        }
      }

      if (!notReadyBrowser) {
        if (
          buildAssets.includes('ssr.js') ||
          buildAssets.includes('styleguide_ssr.js') ||
          buildAssets.includes('server.js')
        ) {
          // activeServer.broadcast({ type: 'TDS_CLIENT_RELOAD' })
          activeServer.broadcast({ reload: true })
        } else if (
          buildAssets.find(file => file.match(/\.(s?css|styl|less)$/))
        ) {
          // activeServer.broadcast({ type: 'TDS_CLIENT_UPDATE_STYLE' })
          activeServer.broadcast({ updateCss: true })
        }
      }
    }
  }
  return typeof callback === 'function' ? callback(activeServer) : activeServer
}

module.exports = createServer
