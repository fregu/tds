## Refactor server.js

- Make server.js import 'lib/config' to bundle in build
- refactor middleware, utils, and actions of server in separate files/directories
- subtract crucial config for prod-bundle.

!!beware of - FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory




always run server via webpack too? to use full power of loaders and es6 even in dev.

createServer(mode = 'dev')
  const isDev = mode === 'dev'
  const config = parse(process.cwd())

  const app = new Koa()

  middlewares.forEach(middleware => app.use(middleware))

  serve('/assets', assets)
  createSchema(config)
  ssrRender(config)
  styleguide(config)
