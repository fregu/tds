import 'regenerator-runtime/runtime'
import resolvers from '../webpack/loaders/graphqlResolvers'
import typeDefs from '../webpack/loaders/graphqlTypes'
import schema from '../webpack/loaders/graphqlSchema'
import * as middlewares from '../webpack/loaders/serverMiddlewares'
import tdsConfig from '../webpack/loaders/serverConfig'
import createServer from '../server/createServer'
import ssrRender from './ssr'
// import styleguideSsrRender from './styleguide_ssr'
import dotenv from 'dotenv'
dotenv.config()

const { server = {}, graphql: graphqlConfig = {}, keys = {}, ...restConfig } =
  tdsConfig || {}
const config = {
  ...restConfig,
  mode: process.env.NODE_ENV || 'production',
  server: {
    ...server,
    protocol: process.env.PROTOCOL || 'http',
    host: process.env.HOST_NAME || server.host || 'localhost',
    port: process.env.PORT || server.port || '3000',
    publicPath: process.env.PUBLIC_PATH || server.publicPath || '/',
    middlewares: middlewares || []
  },
  graphql: {
    ...graphqlConfig,
    typeDefs,
    resolvers,
    schema: schema
  },
  keys: {
    ...(keys || {}),
    applicationInsights:
      process.env.APPLICATION_INSIGHTS_KEY || keys.applicationInsights,
    analytics: process.env.GOOGLE_ANALYTICS_KEY || keys.analytics,
    tagManager: process.env.GOOGLE_TAG_MANAGER_KEY || keys.tagManager
  },
  ssrRender
  // styleguideSsrRender
}

export default config

if (require.main !== module) {
  console.log('called from cli', config)
  createServer(config)
}
