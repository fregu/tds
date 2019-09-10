#!/usr/bin/env node

const builder = require('../lib/build')
const generators = require('../generators')
const runner = require('../lib/server/runner')
const config = require('../lib/config')()
const fs = require('fs')
const parser = require('../lib/parser/parse')
const packageJSON = require('../package.json')

if (process.argv.length > 2) {
  const dir = process.cwd()
  const command = process.argv[2]
  // const specifier =
  //   process.argv[3] && !process.argv[3].match(/^-/) && process.argv[3]
  const flags = process.argv
    .filter(arg => arg.match(/^-/))
    .map(arg => arg.replace(/^--?/, ''))

  const mode =
    flags.includes('prod') ||
    flags.includes('production') ||
    process.env.NODE_ENV === 'production'
      ? 'production'
      : 'development'

  if (flags.includes('v')) {
    console.log('Current Tediuos version is: ', packageJSON.version)
    return
  }
  if (flags.includes('verbose')) {
    config.verbose = true
    return
  }

  switch (command) {
    case 'init':
      console.log('Setting up new Tedious project setup')
      generators(config).init()

      break

    case 'update':
      const exec = require('child_process').exec
      console.log('Updating @jayway/tds')
      exec('yarn install @jayway/tds', console.log)
      break

    case 'build':
      builder({ ...config, mode })
        .server()
        .run((stats, assets) => console.log('build done', assets))
      break
    case 'styleguide':
      // const styleguide = require('../lib/styleguide')(config)
      // if (flags.includes('build')) {
      //   styleguide.build()
      // } else {
      //   styleguide.serve()
      // }
      runner({ ...config, mode }, 'styleguide')
      break
    case 'start':
      runner({ ...config, mode })
      break
    case 'test':
      console.log(
        'Not yet implemented, would be running your tests, lints and type testers right now otherwise'
      )
      break
    case 'parse':
      fs.writeFileSync(`${dir}/oldConfig.json`, JSON.stringify(config, null, 2))
      fs.writeFileSync(
        `${dir}/fullConfig.json`,
        JSON.stringify(parser(dir), null, 2)
      )
      break
  }
} else {
  console.log('available commands...')
}
