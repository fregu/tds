import 'regenerator-runtime/runtime'
import resolvers from '../webpack/loaders/graphqlResolvers'
import typeDefs from '../webpack/loaders/graphqlTypes'
import schema from '../webpack/loaders/graphqlSchema'
import * as middlewares from '../webpack/loaders/serverMiddlewares'
import tdsConfig from '../webpack/loaders/serverConfig'
import createServer from '../server/createServer'
import ssrRender from './ssr'
import dotenv from 'dotenv'
dotenv.config()

const { server = {}, graphql: graphqlConfig = {}, keys = {} } = tdsConfig || {}
const config = {
  mode: process.env.NODE_ENV || 'production',
  server: {
    ...server,
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
  ssrRender,
  applicationInsights: process.env.APPLICATION_INSIGHTS_KEY || keys.appInsights,
  analyticsKey: process.env.GOOGLE_ANALYTICS_KEY || keys.analytics
}

export default config

if (require.main !== module) {
  console.log('called from cli', config)
  createServer(config)
}
