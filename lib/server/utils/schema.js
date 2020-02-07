const { makeExecutableSchema } = require('graphql-tools')
const pubsub = require('./pubsub')

const typeDefs = `
  type Query {
    status: String
  }
  type Subscription {
    tds: TdsMessage
  }
  type TdsMessage {
    updateCss: Boolean
    reload: Boolean
    error: TdsError
  }
  type TdsError {
    name: String
    message: String
    fileName: String
    lineNumber: String
  }
`
module.exports = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      status: () => 'connected'
    },
    Subscription: {
      tds: {
        subscribe: () => pubsub.asyncIterator('TDS_UPDATE')
      }
    }
  }
})
