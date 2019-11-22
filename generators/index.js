const exec = require('child_process').exec
const path = require('path')
const fs = require('fs-extra')
const dependencies = [
  '@jayway/tds',
  '@jayway/tds-ui',
  '@jayway/tds-styleguide',
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
  '@babel/preset-env',
  'babel-eslint',
  'babel-plugin-module-resolver'
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
        console.log('[TDS]:', 'package.json has been updated')
        resolve()
      }
    )
  })
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      resolve(stdout)
    })
  })
}
module.exports = function({ path: rootPath }) {
  return {
    init() {
      let promiseTree = new Promise(resolve => resolve())
      const rootFiles = fs
        .readdirSync(rootPath)
        .filter(f => fs.lstatSync(path.resolve(rootPath, f)).isFile())

      if (!rootFiles.includes('package.json')) {
        console.log('[TDS]:', 'Setting up a new project')
        promiseTree = promiseTree.then(() => execPromise('yarn init -y'))
      }

      promiseTree
        .then(() => {
          console.log('[TDS]:', 'Updating package.json scripts')
          return updatePackageJsonScripts(
            {
              start: 'tds start',
              build: 'tds build',
              styleguide: 'tds styleguide',
              serve: 'node dist/run.js',
              lint: 'eslint .'
            },
            rootPath
          )
        })
        .then(() => {
          console.log('[TDS]:', 'Adding boilerplate files')
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
          console.log('[TDS]:', 'Installing devDependencies')
          return execPromise('yarn add --dev ' + devDependencies.join(' '))
        })
        .then(() => {
          console.log('[TDS]:', 'Installing dependencies')
          return execPromise('yarn add ' + dependencies.join(' '))
        })
        .catch(error => {
          console.error('[TDS]:', error)
        })
    },
    cms() {
      new Promise(resolve => resolve())
        .then(() => {
          console.log('[TDS]: Installing strapi@alpha')
          execPromise('yarn add global strapi@alpha')
        })
        .then(() => {
          console.log('[TDS]: Updating package.json scripts')
          return updatePackageJsonScripts({
            cms: 'cd cms && strapi start'
          })
        })
        .then(() => {
          console.log('[TDS]: Starting up Stapi cms')
          return execPromise('strapi new cms --quickstart')
        })
    }
  }
}
