const resolvers = {
  Query: {
    hello: (root, { name }, ctx) => `Hello ${name || 'yourself'}`
  }
}
module.exports = resolvers
