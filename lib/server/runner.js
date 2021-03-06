const build = require('../build')
const fs = require('fs-extra')
const path = require('path')
const MemoryFileSystem = require('memory-fs')
const createServer = require('./createServer')
const requestModuleFromFileSystem = require('./utils/requestModuleFromFileSystem')
const chalk = require('chalk')

module.exports = async function runner(config, buildPack = 'dev') {
  // Start up server
  console.log(chalk.blue('[TDS]:'), chalk.green('Starting the runner'))

  const builder = build()
  const { mode = 'development', distPath } = config
  const isDev = mode === 'development'
  const fileSystem = isDev ? new MemoryFileSystem() : fs
  let activeServer

  function startServer(config) {
    createServer(config, server => {
      activeServer = server
    })
  }

  let assets = []
  await new Promise(resolve =>
    builder.server(fileSystem).run(async stats => {
      const { buildAssets = [] } = stats

      assets = [...new Set([...(assets || []), ...buildAssets])]

      if (assets.includes('server.js')) {
        const { config: serverConfig } = await requestModuleFromFileSystem(
          path.resolve(distPath, 'server.js'),
          fileSystem
        )

        startServer({ ...serverConfig, assets, fileSystem, isBuilding: true })
        resolve()
      }
    })
  )

  builder[buildPack](fileSystem).watch(
    {
      ignored: ['dist', 'node_modules'],
      aggregateTimeout: 300,
      poll: 1000
    },
    async status => {
      const { buildAssets = [], changedFiles = [], error } = status
      assets = [...new Set([...(assets || []), ...buildAssets])]

      if (changedFiles.length) {
        console.log(
          chalk.blue('[TDS]:'),
          chalk.green('Files changed'),
          chalk.yellow(changedFiles)
        )
      }

      if (activeServer) {
        if (!error) {
          activeServer.update(buildAssets)
          activeServer.ready()
        } else {
          activeServer.broadcast({
            error: { name: 'errr', message: 'wrong' }
          })
        }
      }
    }
  )
}
