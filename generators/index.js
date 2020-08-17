const exec = require('child_process').exec
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const dependencies = [
  '@jayway/tds',
  '@jayway/tds-ui',
  // '@jayway/tds-styleguide',
  'react',
  'react-dom',
  'react-redux',
  'react-router-dom'
]
const devDependencies = [
  'prettier',
  'eslint',
  'eslint-config-prettier',
  'eslint-config-standard',
  'eslint-plugin-standard',
  'eslint-plugin-node',
  'eslint-plugin-babel',
  'eslint-plugin-flowtype',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-prettier',
  'eslint-plugin-promise',
  'eslint-plugin-react',
  '@babel/core',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-optional-chaining',
  '@babel/preset-react',
  '@babel/preset-flow',
  '@babel/preset-typescript',
  '@babel/preset-env',
  'babel-loader',
  'babel-eslint',
  'babel-plugin-module-resolver',
  'jest',
  'ts-jest',
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@types/jest',
  '@types/react',
  '@types/react-dom',
  '@types/testing-library__react',
  '@types/testing-library__jest-dom'
]

function updatePackageJsonScripts(scripts = {}, rootPath) {
  return new Promise((resolve, reject) => {
    const packageJSON = require(path.join(rootPath, 'package.json'))

    packageJSON.scripts = {
      ...Object.keys(packageJSON.scripts || {})
        .filter(key => Object.keys(scripts).includes(key))
        .reduce(
          (scripts, key) => ({
            ...scripts,
            [key]: packageJSON.scripts[key]
          }),
          {}
        ),
      ...scripts
    }

    fs.writeFile(
      path.join(rootPath, 'package.json'),
      JSON.stringify(packageJSON, null, 2),
      err => {
        if (err) {
          return reject(err)
        }
        console.log(
          chalk.blue('[TDS]:'),
          chalk.green('package.json has been updated')
        )
        resolve()
      }
    )
  })
}

module.exports = function({ path: rootPath }) {
  function execPromise(command) {
    return new Promise((resolve, reject) => {
      exec(`cd ${rootPath} && ${command}`, (error, stdout, stderr) => {
        if (error) {
          return reject(error)
        }

        resolve(stdout)
      })
    })
  }
  return {
    init: async () => {
      const hasYarn = await execPromise('yarn -v')
        .then(() => true)
        .catch(() => false)
      let promiseTree = new Promise(resolve => resolve())

      const rootFiles = fs
        .readdirSync(rootPath)
        .filter(f => fs.lstatSync(path.resolve(rootPath, f)).isFile())

      if (!rootFiles.includes('package.json')) {
        console.log(
          chalk.blue('[TDS]:'),
          chalk.green('Setting up a new project')
        )
        promiseTree = promiseTree.then(() => {
          execPromise(`${hasYarn ? 'yarn' : 'npm'} init -y`)
        })
      }

      promiseTree
        .then(() => {
          console.log(
            chalk.blue('[TDS]:'),
            chalk.green('Updating package.json scripts')
          )
          return updatePackageJsonScripts(
            {
              start: 'tds start',
              build: 'tds build',
              styleguide: 'tds styleguide',
              eject: 'tds eject',
              serve: 'node dist/run.js',
              lint: 'eslint .',
              test: 'jest',
              'check-types': 'tsc'
            },
            rootPath
          )
        })
        .then(() => {
          console.log(
            chalk.blue('[TDS]:'),
            chalk.green('Adding boilerplate files')
          )
          return new Promise((resolve, reject) => {
            fs.copy(path.join(__dirname, '/init'), rootPath, function(error) {
              if (error) {
                return reject(error)
              }
              return resolve()
            })
          })
        })
        .then(() => {
          console.log(
            chalk.blue('[TDS]:'),
            chalk.green('Installing devDependencies')
          )
          return execPromise(
            (hasYarn ? 'yarn add --dev ' : 'npm install --save-dev ') +
              devDependencies.join(' ')
          )
        })
        .then(() => {
          console.log(
            chalk.blue('[TDS]:'),
            chalk.green('Installing dependencies')
          )
          return execPromise(
            (hasYarn ? 'yarn add ' : 'npm install ') + dependencies.join(' ')
          )
        })
        .catch(error => {
          console.error('[TDS]:', error)
        })
    }
  }
}
