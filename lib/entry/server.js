import 'regenerator-runtime/runtime'
import * as resolvers from '../webpack/loaders/graphqlResolvers'
import typeDefs from '../webpack/loaders/graphqlTypes'
import schema from '../webpack/loaders/graphqlSchema'
import middlewares from '../webpack/loaders/serverMiddlewares'
import cronJobs from '../webpack/loaders/cronJobs'
import tdsConfig from '../webpack/loaders/serverConfig'
import createServer from '../server/createServer'
import dotenv from 'dotenv'
dotenv.config()

const {
  appUrl,
  server = {},
  graphql: graphqlConfig = {},
  keys = {},
  db,
  ...restConfig
} = tdsConfig || {}

export const config = {
  ...restConfig,
  appUrl: process.env.APP_URL || appUrl,
  mode: process.env.NODE_ENV || 'production',
  server: {
    ...server,
    protocol: process.env.PROTOCOL || 'http',
    host: process.env.HOST_NAME || server.host || 'localhost',
    port: process.env.PORT || server.port || '3000',
    publicPath: process.env.PUBLIC_PATH || server.publicPath || '/',
    middlewares: middlewares || [],
    sessionKey: process.env.SESSION_KEY,
    cron: cronJobs || false
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
  db: (db || process.env.DATABASE_CLIENT) && {
    client: process.env.DATABASE_CLIENT || db.client || 'sqlite3',
    connection: {
      filename: './tmp/mydb.sqlite',
      host: process.env.DATABASE_HOST || db.host || '127.0.0.1',
      user: process.env.DATABASE_USER || db.user,
      password: process.env.DATABASE_PASSWORD || db.password,
      database: process.env.DATABASE_NAME || db.database
    }
  }
  // ssrRender
  // styleguideSsrRender
}

export const run = () => createServer(config)
export default config => createServer(config)
