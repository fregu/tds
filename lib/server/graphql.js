const path = require('path')
const { GraphQLSchema, print } = require('../webpack/loaders/graphqlLoader')
const fetch = require('node-fetch')
const { ApolloServer, gql } = require('apollo-server-koa')
const { HttpLink, createHttpLink } = require('apollo-link-http')
const { setContext } = require('apollo-link-context')
const { printSchema } = require('graphql/utilities')
const { mergeTypes } = require('merge-graphql-schemas')
const {
  makeExecutableSchema,
  introspectSchema,
  addMockFunctionsToSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
  RenameTypes,
  RenameRootFields,
  TransformRootFields
} = require('graphql-tools')

module.exports = async function getSchema(config = {}) {
  const {
    graphql: { remoteSchemas = [], typeDefs, resolvers: resolverSrc } = {}
  } = config
  const resolvers = resolverSrc
    ? require(path.resolve(config.path, resolverSrc))
    : {}
  let externalSchemas = []
  let localSchema = false

  if (remoteSchemas.length) {
    externalSchemas = await Promise.all(
      remoteSchemas.map(
        ({ url, token, prefix: prefixName }) =>
          new Promise(async resolve => {
            const remoteLink = createHttpLink({
              uri: url,
              fetch,
              headers: token ? { authorization: `Bearer ${token}` } : {}
            })
            const externalSchema = await introspectSchema(remoteLink)
            let executableShema = makeRemoteExecutableSchema({
              schema: externalSchema,
              link: remoteLink
            })

            if (prefixName) {
              executableShema = transformSchema(executableShema, [
                new RenameTypes(type => `${prefixName}_${type}`),
                new RenameRootFields(
                  (operation, name) => `${prefixName}_${name}`
                )
              ])
            }

            resolve(executableShema)
          })
      )
    )
  }
  if (typeDefs) {
    // merge all extenal schemas if any
    const externalDefs = gql(
      mergeTypes(
        (externalSchemas || []).map(schema => gql(printSchema(schema)))
      )
    )
    // make sure to remove any schema definition and Root definitions
    const externalDefsWithOutSchema = {
      ...externalDefs,
      definitions: externalDefs.definitions.filter(
        def =>
          def.kind !== 'SchemaDefinition' &&
          !(
            def.kind === 'ObjectTypeDefinition' &&
            ['Query', 'Mutation', 'Subscription'].includes(def.name.value)
          )
      )
    }

    // merge external and internal types, allowing local overrides using external types
    const mergedTypeDefs = mergeTypes([
      externalDefsWithOutSchema,
      gql`
        ${typeDefs}
      `
    ])

    localSchema = await makeExecutableSchema({
      typeDefs: mergedTypeDefs
    })
  }

  return localSchema || externalSchemas.length
    ? mergeSchemas({
        schemas: [...externalSchemas, localSchema].filter(Boolean),
        resolvers
      })
    : false
}
