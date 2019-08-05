const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const historyFallback = require('koa2-history-api-fallback')
const serve = require('koa-static')
const mount = require('koa-mount')
const builder = require('../build')
const fs = require('fs')
const MemoryFileSystem = require('memory-fs')
const mime = require('mime-types')
const requireFromString = require('require-from-string')
const websockify = require('koa-websocket')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
require('regenerator-runtime/runtime')

let assets = [] // appended with any webpacked assets
let htmlTemplate = '<html>hej</html>' // replaced by webpacked index.html
let styleguideHtmlTemplate = '<html></html>'
let ssrRender // Replaced by webpacked ssr entry
let styleguideSsrRender
let broadcaster = () => {} // replaced by websocket messaging

async function createServer(config) {
  const {
    mode = 'development',
    server: {
      host = 'localhost',
      port = 4000,
      publicPath = '/',
      middlewares = [],
      routes = []
    } = {},
    applicationInsights: { key: appInsightsKey } = {},
    errorHandler // Hook up appInsights
  } = config

  const isDev = mode !== 'production'
  const distPath = (config.paths && config.paths.dist) || 'dist'
  const app = websockify(new Koa())
  const router = new Router()
  const fileSystem = isDev ? new MemoryFileSystem() : fs

  let browserWatcher
  let styleguideWatcher
  let notReadyBrowser
  let notReadyStyleguide

  // sessions
  const session = require('koa-session')
  app.keys = ['super secret TDS key']
  const sessionConfig = {
    key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    signed: true /** (boolean) signed or not (default true) */,
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
  }
  app.use(session(sessionConfig, app))

  // body parser
  const bodyParser = require('koa-bodyparser')
  app.use(bodyParser())

  // auth
  // const passport = require('koa-passport')
  // app.use(passport.initialize())
  // app.use(passport.session())

  if (!isDev) {
    // Enable compression
    const compress = require('koa-compress')
    app.use(compress())

    // Secure headers
    const helmet = require('koa-helmet')
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

  // Set up file watcher and build bundles for browser and SSR
  if (isDev) {
    notReadyBrowser = true
    notReadyStyleguide = true
    browserWatcher = builder()
      .dev(fileSystem)
      .watch(
        {
          ignored: ['dist', 'node_modules']
        },
        stats => {
          const { buildAssets, changedFiles = [] } = stats

          if (changedFiles.length) {
            console.log('changedFiles', changedFiles)
          }

          assets = [...new Set([...assets, ...buildAssets])]

          console.log('buildAssets', buildAssets)

          if (buildAssets.includes('index.html')) {
            htmlTemplate = fileSystem.readFileSync(
              path.resolve(distPath, 'index.html'),
              'utf-8'
            )
          }
          if (buildAssets.includes('ssr.js')) {
            const ssrContent = fileSystem.readFileSync(
              path.resolve(distPath, 'ssr.js'),
              'utf-8'
            )
            ssrRender = requireFromString(ssrContent, 'ssr.js').default
          }
          // if (buildAssets.includes('styleguide_ssr.js')) {
          //   const styleguideSsrContent = fileSystem.readFileSync(
          //     path.resolve(distPath, 'styleguide_ssr.js'),
          //     'utf-8'
          //   )
          //   styleguideSsrRender = requireFromString(
          //     styleguideSsrContent,
          //     'styleguide_ssr.js'
          //   ).default
          // }

          notReadyBrowser = false

          if (buildAssets.includes('ssr.js')) {
            broadcaster({ type: 'TDS_CLIENT_RELOAD' })
          } else if (
            changedFiles.find(file => file.match(/\.(s?css|styl|less)$/))
          ) {
            broadcaster({ type: 'TDS_CLIENT_UPDATE_STYLE' })
          }
        }
      )
    // styleguideWatcher = builder()
    //   .styleguide(fileSystem)
    //   .watch(
    //     {
    //       ignored: ['dist', 'node_modules']
    //     },
    //     stats => {
    //       const { buildAssets, changedFiles = [] } = stats
    //
    //       if (changedFiles.length) {
    //         console.log('changedFiles', changedFiles)
    //       }
    //
    //       assets = [...new Set([...assets, ...buildAssets])]
    //
    //       if (buildAssets.includes('styleguide.html')) {
    //         styleguideHtmlTemplate = fileSystem.readFileSync(
    //           path.resolve(distPath, 'styleguide.html'),
    //           'utf-8'
    //         )
    //       }
    //       if (buildAssets.includes('styleguide_ssr.js')) {
    //         const styleguideSsrContent = fileSystem.readFileSync(
    //           path.resolve(distPath, 'styleguide_ssr.js'),
    //           'utf-8'
    //         )
    //         styleguideSsrRender = requireFromString(
    //           styleguideSsrContent,
    //           'styleguide_ssr.js'
    //         ).default
    //       }
    //
    //       notReadyStyleguide = false
    //
    //       if (buildAssets.includes('styleguide_ssr.js')) {
    //         broadcaster({ type: 'TDS_STYLEGUIDE_RELOAD' })
    //       } else if (
    //         changedFiles.find(file => file.match(/\.(s?css|styl|less)$/))
    //       ) {
    //         broadcaster({ type: 'TDS_STYLEGUIDE_UPDATE_STYLE' })
    //       }
    //     }
    //   )
  } else {
    // try to read ssr file from dist, but since a require will get bundled, read from filesystem i prod
    const ssrPath = path.resolve(process.cwd(), 'dist', 'ssr.js')
    try {
      const ssrContent = fileSystem.readFileSync(ssrPath, 'utf-8')
      ssrRender = requireFromString(ssrContent, ssrPath).default
    } catch (err) {
      console.log('could not load entry file ', ssrPath)
      console.error(err)
    }
  }

  // Web socket middleware to set up client messaging and broadcaster function
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
      return next()
    }
  })

  // Hold requersts until first build is finished
  app.use(async (ctx, next) => {
    if (notReadyBrowser || notReadyStyleguide) {
      console.log('Wait until bundle is ready')
      await waitForIt()
    }
    return next()
  })

  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      if (appInsightsKey) {
        const appInsights = require('applicationinsights')
        appInsights
          .setup(appInsightsKey)
          .setAutoCollectConsole(true)
          .start()
        const client = appInsights.defaultClient
        if (client) {
          client.trackException({ exception: e })
        }
      }
      if (typeof errorHandler === 'function') {
        errorHandler(e, ctx, next)
      } else {
        console.log('Error:', e)
        ctx.body = `
            <p>There was an error. Please try again later.</p>
            <p>${e.name}: "${e.message}"${
          e.fileName && e.lineNumber ? `${e.fileName}:${e.lineNumber}` : ''
        }</p>
          <p>Waiting for file change</p>
          <script>var socket = new WebSocket("ws://${host}:${port}", "clientSocket");

          socket.onopen = function(event) {
            socket.onmessage = event => {
              try {
                const message = JSON.parse(event.data);
                if (message.type === 'TDS_CLIENT_RELOAD') {
                  window.location.reload(true);
                }
              } catch (err) {
                console.log("[TDS]: message", event.data);
              }
            };
          }
          </script>`
      }
    }
  })

  if (config.graphql) {
    config.graphql.endpoint = `http://${host}${port ? `:${port}` : ''}/graphql`

    const { ApolloServer } = require('apollo-server-koa')
    const createGraphQLSchema = require('./utils/createGraphQLSchema')

    // Get DBSchemas to merge if config.db

    const schema = await createGraphQLSchema({
      ...config.graphql,
      resolvers: config.graphql.resolvers
        ? require(config.graphql.resolvers)
        : false,
      schema: config.graphql.schema ? require(config.graphql.schema) : false
    }) // , DBSchemas)
    if (schema) {
      const apollo = new ApolloServer({
        schema: schema,
        context: ({ ctx }) => ctx,
        introspection: true,
        playground: true
      })

      apollo.applyMiddleware({ app, path: '/graphql' })
    }
  }
  // app.use(router.routes()).use(router.allowedMethods());

  middlewares.forEach(filePath => {
    const middleware = require(filePath)
    app.use(middleware)
  })

  app.use(mount('/styleguide', serve(path.join(distPath, 'styleguide'))))

  routes.forEach(({ method, route, handler }) => {
    router[method](route, handler)
  })

  // Route sub-routes to same index.html
  if (isDev) {
    // Serve assets from memory-fs
    app.use((ctx, next) => {
      const assetMatch = assets.find(a => ctx.path === `${publicPath}${a}`)
      if (
        assetMatch &&
        (ctx.path !== `${publicPath}index.html` || !ssrRender)
      ) {
        ctx.status = 200
        ctx.type = mime.contentType(assetMatch)
        ctx.body = fileSystem.readFileSync(path.resolve(distPath, assetMatch))
        return
      }
      return next()
    })
  }
  // Server side rendered styleguide
  app.use(async (ctx, next) => {
    if (
      ctx.path.match(new RegExp(`^${publicPath}styleguide`)) &&
      styleguideSsrRender
    ) {
      ctx.type = 'text/html'
      ctx.status = 200
      const html = styleguideSsrRender
        ? await styleguideSsrRender(
            {
              ...config,
              server: {
                ...(config.server || {}),
                socketEndpoint: `ws://${host}:${port}`
              }
            },
            styleguideHtmlTemplate,
            ctx
          )
        : fileSystem.createReadStream(path.resolve(distPath, 'styleguide.html'))
      ctx.body = html
      return
    }
    return next()
  })

  app.use(historyFallback())

  // Server side rendered app
  app.use(async (ctx, next) => {
    if (ctx.path === `${publicPath}index.html` && ssrRender) {
      ctx.type = 'text/html'
      ctx.status = 200
      const html = ssrRender
        ? await ssrRender(
            {
              ...config,
              server: {
                ...(config.server || {}),
                socketEndpoint: `ws://${host}:${port}`
              }
            },
            htmlTemplate,
            ctx
          )
        : fileSystem.createReadStream(path.resolve(distPath, 'index.html'))
      ctx.body = html
    }
  })

  // Serve real files from dist folder
  app.use(mount(publicPath, serve(distPath)))

  app.listen(port, () => {
    console.log(`Server listening on http://${host}${port ? `:${port}` : ''}`)
  })
}

module.exports = createServer
