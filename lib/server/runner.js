const builder = require('../build')
const fs = require('fs')
const path = require('path')
const MemoryFileSystem = require('memory-fs')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
const createServer = require('./createServer')

module.exports = async function runner(config) {
  const {
    mode = 'development',
    paths: { dist: distPath = '/dist' } = {},
    graphql
  } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs

  // return startGraphQLServer({
  //   ...graphql,
  //   resolvers: graphql.resolvers && require(graphql.resolvers),
  //   schema: graphql.schema && require(graphql.schema)
  // })

  // Start up server initially
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
  let assets = []
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

        assets = [...new Set([...assets, ...buildAssets])]

        server.ready()
        server.update(buildAssets)
        // if (
        //   !server.context &&
        //   typeof server.context.isReady !== 'undefined' &&
        //   !server.context.isReady
        // ) {
        //   server.ready(assets)
        // } else {
        //   server.update(buildAssets)
        // }

        if (buildAssets.includes('server.js')) {
          // const serverConfig = requestModuleFromFileSystem(
          //   path.resolve(distPath, 'server.js'),
          //   fileSystem
          // ).default
          // server.restart(serverConfig)
          // } else if (buildAssets.includes('ssr.js')) {
          //   const newSSRRender = requestModuleFromFileSystem(
          //     fileSystem,
          //     distPath,
          //     'ssr.js'
          //   ).default
          //   if (newSSRRender) {
          //     updatedState.ssrRender = newSSRRender
          //   }
          // } else if (
          //   changedFiles.find(file => file.match(/\.(s?css|styl|less)$/))
          // ) {
          //   server.updateStyles()
        }
        // server.update(updatedState)
      }
    )
}
