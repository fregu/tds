const build = require('../build')
const fs = require('fs-extra')
const path = require('path')
const MemoryFileSystem = require('memory-fs')
const createServer = require('./createServer')
const httpServer = require('./http')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
// const generateConfig = require('../config')
module.exports = async function runner(config, buildPack = 'dev') {
  // Start up server
  console.log('start the runner')
  const builder = build()
  const {
    mode = 'development',
    distPath,
    verbose,
    server: { port = 4000 } = {}
  } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs
  let activeServer
  if (verbose) {
    console.log('string runner')
  }
  // let server = await startServer(config, fileSystem)
  // if (server.start) {
  //   server.start()
  // }

  function startServer(config) {
    console.log('start it up', config)
    createServer(config, server => {
      console.log('start up the server')
      activeServer = server
      server.start()
    })
  }

  // const server = httpServer()
  // server.listen(port)

  let isReady = false
  let assets = []

  builder.server(fileSystem).run(async stats => {
    const { buildAssets = [] } = stats

    console.log('buildAssets', buildAssets)

    assets = [...new Set([...(assets || []), ...buildAssets])]

    if (assets.includes('server.js')) {
      console.log('found server.js')

      const { config: serverConfig } = await requestModuleFromFileSystem(
        path.resolve(distPath, 'server.js'),
        fileSystem
      )

      startServer({ ...serverConfig, assets, fileSystem })
    }
  })

  builder[buildPack](fileSystem).watch(
    {
      ignored: ['dist', 'node_modules'],
      aggregateTimeout: 300,
      poll: 1000
    },
    async stats => {
      const { buildAssets = [], changedFiles = [] } = stats
      assets = [...new Set([...(assets || []), ...buildAssets])]

      if (changedFiles.length) {
        console.log('changedFiles', changedFiles)
      }

      if (activeServer && activeServer.update) {
        activeServer.update(buildAssets)
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
