const builder = require('../build')
const fs = require('fs')
const MemoryFileSystem = require('memory-fs')
const createServer = require('./createServer')
const generateConfig = require('../config')

function startServer(config, fileSystem) {
  const { graphql } = config
  console.log(
    'graphql.resolvers',
    graphql.resolvers,
    graphql.resolvers
      .map(resolver => require(resolver))
      .reduce((all, resolver) => ({ ...all, ...resolver }), {})
  )
  return createServer({
    isBuilding: true,
    ...config,
    fileSystem,
    graphql: {
      ...graphql,
      typeDefs:
        graphql.types &&
        graphql.types.map(path => fs.readFileSync(path, 'utf-8')).join('\n'),
      resolvers: graphql.resolvers
        ? graphql.resolvers
            .map(resolver => require(resolver))
            .reduce((all, resolver) => ({ ...all, ...resolver }), {})
        : {},
      schema: graphql.schema && require(graphql.schema)
    }
  })
}

module.exports = async function runner(config, buildPack = 'dev') {
  // Start up server
  const { mode = 'development', verbose } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs

  if (verbose) {
    console.log('string runner')
  }
  let server = await startServer(config, fileSystem)

  let isReady = false

  // Start build task with watcher for file change
  builder()
    [buildPack](fileSystem)
    .watch(
      {
        ignored: ['dist', 'node_modules'],
        aggregateTimeout: 300,
        poll: 1000
      },
      async stats => {
        const { buildAssets, changedFiles = [] } = stats

        if (changedFiles.length) {
          console.log('changedFiles', changedFiles)
        }
        if (server && server.update) {
          server.update(buildAssets)
        }

        if (!isReady) {
          server.ready()
          isReady = true
        } else if (
          changedFiles.find(file => file.match(/server|icons|gql|tds\.config/))
        ) {
          // const newConfig = generateConfig()
          // console.log('restarting server')
          // server = await server.restart(newConfig)
          // isReady = false
        }
      }
    )
}
