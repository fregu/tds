#!/usr/bin/env node

const builder = require('../lib/build')
const runner = require('../lib/server/runner')
const fs = require('fs-extra')
const path = require('path')
const parser = require('../lib/parser/parse')
const packageJSON = require('../package.json')
const exec = require('child_process').exec

if (process.argv.length > 2) {
  const dir = process.cwd()
  const config = parser(dir, true)
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
    // config.verbose = true
    return
  }

  switch (command) {
    case 'init': {
      const generators = require('../generators')
      console.log('Setting up new Tedious project setup')
      const directory = process.argv[3] || '.'
      const rootPath = path.resolve(dir, directory)
      fs.ensureDir(rootPath).then(() => generators({ path: rootPath }).init())

      break
    }
    case 'update':
      console.log('Updating @jayway/tds')
      exec('yarn install @jayway/tds', console.log)
      break

    case 'build': {
      const build = builder({ ...config, mode })
      build.server().run(stats => {
        console.log('server build done')
        build
          .browser()
          .run((stats, assets) => console.log('browser build done'))
      })

      break
    }
    case 'styleguide': {
      const styleguide = require('../lib/styleguide')(config)

      if (flags.includes('build')) {
        styleguide.build()
      } else {
        styleguide.serve()
      }

      // runner({ ...parser(dir), mode }, 'styleguide')
      break
    }
    case 'start':
      runner({ ...config, mode })
      break
    case 'test':
      console.log(
        'Not yet implemented, would be running your tests, lints and type testers right now otherwise'
      )
      break

    case 'eject': {
      const localPackageJSON = require(path.resolve(dir, 'package.json'))
      try {
        fs.copySync(
          path.resolve(__dirname, '..', 'lib'),
          path.resolve(dir, 'lib')
        )
        console.log('[TDS]: Copied directory lib')
      } catch (err) {
        console.error(err)
      }

      try {
        fs.copySync(
          path.resolve(__dirname, '..', 'bin'),
          path.resolve(dir, 'bin')
        )
        console.log('[TDS]: Copied directory bin')
      } catch (err) {
        console.error(err)
      }

      if (localPackageJSON) {
        console.log('[TDS]: Updating npm scripts')
        fs.writeJsonSync(path.resolve(dir, 'package.json'), {
          ...localPackageJSON,
          scripts: Object.keys(localPackageJSON.scripts || {}).reduce(
            (scripts, cmd) => ({
              ...scripts,
              ...(!['eject'].includes(cmd)
                ? {
                    [cmd]: localPackageJSON.scripts[cmd].replace(
                      /^tds /,
                      'node ./bin/index.js '
                    )
                  }
                : {})
            }),
            {}
          )
        })

        console.log('[TDS]: Installing dependencies')
        exec(
          `yarn add ${Object.keys(packageJSON.dependencies)
            .map(mod => `${mod}@${packageJSON.dependencies[mod]}`)
            .join(' ')}`,
          () => {
            console.log('[TDS]: Removing @jayway/tds dependency')
            exec(`yarn remove @jayway/tds`, () => {
              // updatePackageJSONScripts({
              //   start: 'node ./bin/index.js start',
              //   build: 'node ./bin/index.js build'
              // })
              console.log('[TDS]: Complete')
            })
          }
        )
      }

      break
    }
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
