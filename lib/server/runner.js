const builder = require('../build')
const fs = require('fs')
const MemoryFileSystem = require('memory-fs')
const createServer = require('./createServer')

module.exports = async function runner(config) {
  const { mode = 'development', graphql } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs

  // Start up server
  const server = await createServer({
    isBuilding: true,
    ...config,
    fileSystem,
    graphql: {
      ...graphql,
      resolvers: graphql.resolvers && require(graphql.resolvers),
      schema: graphql.schema && require(graphql.schema)
    }
  })

  // Start build task with watcher for file change
  builder()
    .dev(fileSystem)
    .watch(
      {
        ignored: ['dist', 'node_modules']
      },
      stats => {
        const { buildAssets, changedFiles = [] } = stats

        if (changedFiles.length) {
          console.log('changedFiles', changedFiles)
        }

        server.update(buildAssets)
        server.ready()
      }
    )
}
