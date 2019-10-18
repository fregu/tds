const builder = require('../build')
const fs = require('fs')
const path = require('path')
const MemoryFileSystem = require('memory-fs')
const createServer = require('./createServer')
const httpServer = require('./http')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
// const generateConfig = require('../config')

function startServer(config = {}, fileSystem, currentServer) {
  const { graphql = {}, ...restConfig } = config

  return createServer({
    currentServer,
    isBuilding: true,
    ...restConfig,
    fileSystem
    // graphql: {
    //   ...graphql,
    //   typeDefs:
    //     graphql.types &&
    //     graphql.types.map(path => fs.readFileSync(path, 'utf-8')).join('\n'),
    //   resolvers: graphql.resolvers
    //     ? graphql.resolvers
    //         .map(resolver => require(resolver))
    //         .reduce((all, resolver) => ({ ...all, ...resolver }), {})
    //     : {},
    //   schema: graphql.schema && require(graphql.schema)
    // }
  })
}

module.exports = async function runner(config, buildPack = 'dev') {
  // Start up server
  console.log('start runner')

  const {
    mode = 'development',
    distPath,
    verbose,
    server: { port = 4000 } = {}
  } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs

  if (verbose) {
    console.log('string runner')
  }
  let server = await startServer(config, fileSystem)
  if (server.start) {
    server.start()
  }

  // const server = httpServer()
  // server.listen(port)
  let isReady = false
  let assets = []
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

        assets = [...new Set([...(assets || []), ...buildAssets])]

        if (changedFiles.length) {
          console.log('changedFiles', changedFiles)
        }

        // if (assets.includes('server.js')) {
        //   //          console.log('found server.js')
        //   const {
        //     default: startServer,
        //     config: serverConfig
        //   } = await requestModuleFromFileSystem(
        //     path.resolve(distPath, 'server.js'),
        //     fileSystem
        //   )
        //
        //   const server = await startServer({
        //     ...serverConfig,
        //     assets,
        //     fileSystem
        //   })
        //   console.log('new app')
        //
        //   // server.update(app)
        // }

        if (server && server.update) {
          server.update(buildAssets)
        }

        if (
          !isReady &&
          assets.includes('ssr.js') &&
          assets.includes('index.html') &&
          assets.includes('server.js')
        ) {
          // server.ready()
          isReady = true
          // } else if (
          //   changedFiles.find(file => file.match(/server|icons|gql|tds\.config/))
          // ) {
          //   // const newConfig = generateConfig()
          //   // console.log('restarting server')
          //   // server = await server.restart(newConfig)
          //   // isReady = false
        }
      }
    )

  // builder()
  //   .styleguide(fileSystem)
  //   .watch(
  //     {
  //       ignored: ['dist', 'node_modules']
  //     },
  //     async stats => {
  //       const { buildAssets, changedFiles = [] } = stats
  //       if (changedFiles.length) {
  //         console.log('styleguide changedFiles', changedFiles)
  //       }
  //       if (server && server.update) {
  //         server.update(buildAssets)
  //       }
  //     }
  //   )
}
