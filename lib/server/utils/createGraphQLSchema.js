const fetch = require('isomorphic-fetch')
const { gql } = require('apollo-server-koa')
const { createHttpLink } = require('apollo-link-http')
const { mergeTypes } = require('merge-graphql-schemas')
const { printSchema } = require('graphql/utilities')
const tediousSchema = require('./schema')
const {
  makeExecutableSchema,
  introspectSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
  RenameTypes,
  RenameRootFields,
  FilterTypes
} = require('graphql-tools')

module.exports = async function createGraphQLSchema({
  remoteSchemas = [],
  typeDefs,
  resolvers = {},
  schema
}) {
  let externalSchemas = []
  let localSchema = false

  if (remoteSchemas.length) {
    externalSchemas = await Promise.all(
      remoteSchemas.map(
        ({ url, token, prefix: prefixName, filterTypes }) =>
          new Promise(async resolve => {
            const remoteLink = createHttpLink({
              uri: url,
              fetch,
              headers: token ? { authorization: `Bearer ${token}` } : {}
            })
            const externalSchema = await introspectSchema(remoteLink)
            const filteredSchema = filterTypes
              ? transformSchema(externalSchema, [
                  new FilterTypes(
                    type => !filterTypes.find(regex => `${type}`.match(regex))
                  )
                ])
              : externalSchema

            let executableShema = makeRemoteExecutableSchema({
              schema: filteredSchema,
              link: remoteLink
            })

            if (prefixName) {
              executableShema = transformSchema(executableShema, [
                ...(prefixName
                  ? [
                      new RenameTypes(type => `${prefixName}_${type}`),
                      new RenameRootFields(
                        (operation, name) => `${prefixName}_${name}`
                      )
                    ]
                  : [])
              ])
            }

            resolve(executableShema)
          })
      )
    )
  }
  if (schema) {
    localSchema = schema
  } else if (typeDefs) {
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
    const mergedTypeDefs = mergeTypes(
      [
        externalDefsWithOutSchema,
        typeof typeDefs === 'string'
          ? gql`
              ${typeDefs}
            `
          : typeDefs
      ],
      { all: true }
    )

    localSchema = await makeExecutableSchema({
      typeDefs: mergedTypeDefs,
      resolverValidationOptions: {
        requireResolversForResolveType: false
      }
    })
  }

  return localSchema || externalSchemas.length
    ? mergeSchemas({
        schemas: [tediousSchema, ...externalSchemas, localSchema].filter(
          Boolean
        ),
        resolvers
      })
    : makeExecutableSchema({
        typeDefs: `type Query {
        loadingSchema: Boolean
      }`,
        resolvers: { Query: { loadingSchema: () => true } }
      })
}
