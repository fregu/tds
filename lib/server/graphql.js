const path = require("path");
const { GraphQLSchema, print } = require("graphql");
const fetch = require("node-fetch");
const { ApolloServer } = require("apollo-server-koa");
const { HttpLink, createHttpLink } = require("apollo-link-http");
const { setContext } = require("apollo-link-context");

const {
  makeExecutableSchema,
  introspectSchema,
  addMockFunctionsToSchema,
  makeRemoteExecutableSchema,
  mergeSchemas
} = require("graphql-tools");

module.exports = async function getSchema(config = {}) {
  console.log(config);

  const { graphql: { remoteSchemas = [], typeDefs, resolvers } = {} } = config;

  let externalSchemas = [];
  let localSchema = false;

  if (remoteSchemas.length) {
    externalSchemas = await Promise.all(
      remoteSchemas.map(
        ({ url, token }) =>
          new Promise(async resolve => {
            const remoteLink = createHttpLink({
              uri: url,
              fetch,
              headers: token ? { authorization: `Bearer ${token}` } : {}
            });
            const externalSchema = await introspectSchema(remoteLink);

            resolve(
              makeRemoteExecutableSchema({
                schema: externalSchema,
                link: remoteLink
              })
            );
          })
      )
    );
  }
  if (typeDefs) {
    localSchema = await makeExecutableSchema({
      typeDefs,
      resolvers: resolvers
        ? require(path.resolve(config.path, resolvers))
        : null
    });
  }
  return mergeSchemas({
    schemas: [localSchema, ...externalSchemas].filter(Boolean)
  });
};
