const path = require('path')
const parseTree = require('directory-tree')
const configDefaults = require('./defaultConfig.js')

const findFiles = require('./utils/findFiles')
const findDirectories = require('./utils/findDirectories')
const findSrc = require('./utils/findSrc')
const resolveTreePath = require('./utils/resolveTreePath')

module.exports = (dir, shallow = false) => {
  const root = dir
  const tree = parseTree(root, {
    exclude: /(node_modules|dist|lib|kit|bin|vendor|bower_components)/
  })

  const nodeModulesTree = parseTree(path.join(root, 'node_modules')) || {}
  const hasTdsUI = resolveTreePath(nodeModulesTree, '@jayway', 'tds-ui', 'src')
  const hasTdsStyleguide = resolveTreePath(
    nodeModulesTree,
    '@jayway',
    'tds-styleguide',
    'src'
  )
  const configFile = findFiles(/tds\.config\.js/, tree, true)

  const config = {
    ...configDefaults,
    ...(configFile ? require(configFile) : {})
  }

  return {
    ...config,
    configFile,
    path: root,
    distPath: config.distPath || 'dist',
    webpack:
      typeof config.webpack !== 'undefined'
        ? config.webpack
        : findFiles(/webpack.config/, tree, true),
    babel:
      typeof config.babel !== 'undefined'
        ? config.babel
        : findFiles(/babelrc/, tree, true),
    entry:
      config.entry ||
      findFiles(
        /(index|App|app)\.(t|j)sx?$/,
        resolveTreePath(tree, 'src'),
        true
      ) ||
      findFiles(/(index|App|app)\.(t|j)sx?$/, tree, true),
    documentation: findFiles(
      /.mdx?/,
      resolveTreePath(tree, /(docs|documentation)/), // TODO: /**/*.md globbing?
      true
    ),
    alias: {
      ...(hasTdsUI ? { ui: hasTdsUI.path } : {}),
      ...(hasTdsStyleguide ? { styleguide: hasTdsStyleguide.path } : {}),
      ...(config.alias || {})
    },
    cssIndex: findFiles(
      /index\.(s?css|less|styl)/,
      resolveTreePath(tree, 'src', /base|patterns/),
      true
    ),
    src: findDirectories('src', tree)
      ? shallow
        ? true
        : findSrc(resolveTreePath(tree, 'src'), '')
      : false,
    tdsUI: !!hasTdsUI,
    tdsStyleguide: !!hasTdsStyleguide,
    ui: findDirectories(
      'tds-ui',
      resolveTreePath(nodeModulesTree, '@jayway'),
      true
    )
      ? shallow
        ? true
        : findSrc(hasTdsUI, 'ui/')
      : false,
    nodeModules: findDirectories(
      /^(react|react-dom|redux|react-redux|graphql|react-router-dom|react-router|react-apollo)$/,
      nodeModulesTree
    ).map(dir => dir.name),
    ...config,
    graphql: {
      queries: findFiles(
        /\.(gql|graphql)/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'queries')
      ),
      mutations: findFiles(
        /\.(gql|graphql)/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'mutations')
      ),
      types:
        // findFiles(
        //   /types.(j|t)sx?$/,
        //   resolveTreePath(tree, 'src', /(gql|graphql)/)
        // ) ||
        findFiles(
          /\.(gql|graphql)$/,
          resolveTreePath(tree, 'src', /(gql|graphql)/, 'types')
        ),
      resolvers:
        findFiles(
          /resolvers\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', /(gql|graphql)/)
        ) ||
        findFiles(
          /(index|resolvers)\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', /(gql|graphql)/, 'resolvers')
        ) ||
        findFiles(
          /\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', /(gql|graphql)/, 'resolvers')
        ),
      schema: findFiles(
        /(index|schema)\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /gql|graphql/),
        true
      ),
      ...(config.graphql || {})
    },
    store: {
      actions: findFiles(
        /\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/, 'actions')
      ),
      middlewares: [
        ...(findFiles(
          /middlewares\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', /(store|redux)/)
        ) ||
          findFiles(
            /\.(j|t)sx?$/,
            resolveTreePath(tree, 'src', /(store|redux)/, 'middlewares')
          ) ||
          []),
        ...(hasTdsUI
          ? [path.join(hasTdsUI.path, 'store/middlewares/index.js')]
          : [])
      ],

      reducers: [
        ...(findFiles(
          /reducers\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', /(store|redux)/)
        ) ||
          findFiles(
            /\.(j|t)sx?$/,
            resolveTreePath(tree, 'src', /(store|redux)/, 'reducers')
          ) ||
          []),
        ...(hasTdsUI
          ? [path.join(hasTdsUI.path, 'store/reducers/index.js')]
          : [])
      ],
      store: findFiles(
        /(index|store)\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/)
      ),
      ...(config.redux || {})
    },
    server: {
      middlewares:
        findFiles(
          /middlewares\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', 'server')
        ) ||
        findFiles(
          /\.(j|t)sx?$/,
          resolveTreePath(tree, 'src', 'server', 'middlewares')
        ),
      ...(config.server || {})
    }
  }
}
