/**
  !! DEPRECTADED
  const tree = parseTree(__dirname)

  return flatMap(parseTree).map(extendComponent)
**/
const fs = require('fs-extra')
const path = require('path')
const parseTree = require('directory-tree')
const ignoreFiles = ['dist', 'node_modules']
const dotenv = require('dotenv')
const reactDocs = require('react-docgen')
dotenv.config()

const watchFiles = [
  {
    type: 'directory',
    test: /^schema|graphql|gql$/i,
    resolve(item, config) {
      const graphqlConfig = {}
      const typeDirectory = item.children.find(
        subItem => subItem.name === 'types'
      )
      const resolversDirectory = item.children.find(
        subItem => subItem.name === 'resolvers'
      )
      if (typeDirectory && typeDirectory.children) {
        graphqlConfig.typeDefs = flattenChildren(typeDirectory.children)
          .map(child => fs.readFileSync(child.path).toString())
          .join('\n')
      }
      if (resolversDirectory && resolversDirectory.children) {
        const resolver = resolversDirectory.children.find(
          subItem =>
            subItem.name === 'index.js' || subItem.name === 'resolvers.js'
        )
        graphqlConfig.resolvers = resolver
          ? path.resolve(config.path, resolver.path)
          : null
      }
      const schemaFile = item.children.find(
        subItem => subItem.name === 'index.js' || subItem.name === 'schema.js'
      )

      if (schemaFile) {
        graphqlConfig.schema = path.resolve(config.path, schema.path)
      }
      config.graphql = {
        ...(config.graphql || {}),
        ...graphqlConfig
      }
    }
  },
  {
    type: 'directory',
    test: /^assets$/i,
    resolve(item, config) {
      config.paths.assets = item.path

      config.src.assets = {
        icons: (
          item.children.find(child => child.name.match(/icons/)) || {
            children: []
          }
        ).children
          .filter(subChild => subChild.name.match(/\.svg$/))
          .reduce(
            (icons, subChild) => ({
              ...icons,
              [subChild.name
                .replace(/\.svg$/, '')
                .replace(/[ -]/g, '')]: subChild.path
            }),
            {}
          ),
        images: (
          item.children.find(child => child.name.match(/images/)) || {
            children: []
          }
        ).children
          .filter(subChild =>
            subChild.name.match(/\.(jpe?g|png|gif|svg|webm)$/)
          )
          .map(subChild => subChild.path),
        fonts: (
          item.children.find(child => child.name.match(/fonts/)) || {
            children: []
          }
        ).children
          .filter(subChild => subChild.name.match(/\.(woff|tft|otf|eot|svg)$/))
          .map(subChild => subChild.path)
      }
    }
  },
  {
    type: 'directory',
    test: /^components|bricks$/i,
    resolve(item, config) {
      config.paths.components = item.path
      config.src.components = [
        ...(config.src.components || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^containers|modules|kits$/i,
    resolve(item, config) {
      config.paths.containers = item.path
      config.src.containers = [
        ...(config.src.containers || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^views|pages|constructions$/i,
    resolve(item, config) {
      config.paths.views = item.path
      config.src.views = [
        ...(config.src.views || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^patterns|base|instructions$/i,
    resolve(item, config) {
      config.paths.patterns = item.path
      const cssIndex = item.children.find(child =>
        child.name.match(/index\.(s?css|less|styl)/)
      )
      if (cssIndex) {
        config.cssIndex = cssIndex.path
      }
      config.src.patterns = [
        ...(config.src.patterns || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^layouts?|plates$/i,
    resolve(item, config) {
      config.paths.layouts = item.path
      config.src.layouts = [
        ...(config.src.layouts || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^helpers|utils/i,
    resolve(item, config) {
      config.paths.helpers = item.path
      config.src.helpers = [
        ...(config.src.helpers || []),
        ...parseComponents(item.children, config.path)
      ]
    }
  },
  {
    type: 'directory',
    test: /^store$/i,
    resolve(item, config) {
      const reducers = item.children.find(
        subItem => subItem.name === 'reducers'
      )
      const middlewares = item.children.find(
        subItem => subItem.name === 'middlewares'
      )
      const index = item.children.find(subItem =>
        subItem.name.match(new RegExp(`^(index|main|${item.name}).(jsx?|ts)$`))
      )
      config.store = {
        ...config.store,
        index: index && index.path,
        reducers: [
          ...((config.store && config.store.reducers) || []),
          ...((reducers &&
            reducers.children &&
            parseScripts(reducers.children, config)) ||
            (reducers && reducers.type === 'file' && [reducers.path]) ||
            [])
        ],
        middlewares: [
          ...((config.store && config.store.middlewares) || []),
          ...((middlewares &&
            middlewares.children &&
            parseScripts(middlewares.children, config)) ||
            (middlewares &&
              middlewares.type === 'file' && [middlewares.path]) ||
            [])
        ]
      }
    }
  }
]

const defaultConfig = {
  mode: process.env.NODE_ENV || 'development',
  src: {},
  env: {}
}

function flattenChildren(array = []) {
  return array.reduce(
    (flatArray, child) => [
      ...flatArray,
      ...(child.children ? flattenChildren(child.children) : [child])
    ],
    []
  )
}

function parseScripts(items, config) {
  return items.reduce((scripts, item) => {
    if (item.children) {
      return [...scripts, ...parseScripts(item.children)]
    } else if (item.type === 'file' && item.name.match(/\.m?jsx?$/)) {
      return [...scripts, item.path]
    }
    return scripts
  }, [])
}
function parseComponents(components = [], rootPath) {
  /*
    Components can be either a file, a set of files with the same name or a folder with files
  */
  return components.reduce((parsedComponents, item) => {
    let component
    const componentName = item.name.replace(/\..*$/, '')
    if (item.type === 'file') {
      // if file not already parsed
      if (
        !parsedComponents.find(comp => comp.name === componentName) &&
        isValidComponentFile(item)
      ) {
        component = parseComponentFiles(
          components.filter(comp =>
            comp.name.match(new RegExp(`^${componentName}.*`))
          ),
          rootPath,
          item
        )
        // TODO ....
      }
      // is css, js
      // find mathing siblings with same name but other prefix
    } else if (item.children) {
      component = parseComponentFiles(item.children, rootPath, item)
    }
    return [
      ...parsedComponents,
      ...(component ? [component] : []),
      ...(item.children
        ? parseComponents(
            item.children.filter(subItem => subItem.type === 'directory'),
            rootPath
          )
        : [])
    ]
  }, [])
}
function isValidComponentFile({ extension }) {
  return extension && extension.match(/^\.(s?css|less|style?|tsx?|jsx?|mdx?)$/)
}
function parseComponentFiles(items, rootPath, item) {
  return items.reduce((component, subItem) => {
    const componentName = item.name.replace(/\..*$/, '')
    if (subItem.type === 'file') {
      const content = fs.readFileSync(subItem.path).toString()

      // Component has script component file
      if (
        subItem.name.match(
          new RegExp(`^(index|main|${componentName}).(jsx?|ts)$`)
        )
      ) {
        component.filePath = subItem.path
        component.name = componentName
        component.path = item.path
        component.fullPath = path.resolve(rootPath, '..', item.path)
        component.dependencies = (
          content.match(/import (.*) from ["'](.*)["']/g) || []
        ).reduce((dependencies, dependency) => {
          const stringMatch = dependency.match(/import (.*) from ["'](.*)["']/)
          return { ...dependencies, [stringMatch[1]]: stringMatch[2] }
        }, {})
        try {
          component.props = reactDocs.parse(content)
        } catch (err) {
          /* no props found */
        }
      }
      component.files = [...(component.files || []), { ...subItem, content }]
      if (subItem.name.match(new RegExp(`.(s?css|less|style?)$`))) {
        component.css = {
          files: [
            ...((component.css && component.css.files) || []),
            subItem.path
          ],
          imports: [
            ...((component.css && component.css.imports) || []),
            ...(content.match(/@import ["'](.*)["']/g) || []).reduce(
              (imports, importString) => {
                const importMatch = importString.match(/@import ["'](.*)["']/)
                return [...imports, importMatch[1]]
              },
              []
            )
          ],
          variables: {
            ...((component.css && component.css.variables) || {}),
            ...(content.match(/--(.*): ?(.*);/g) || []).reduce(
              (vars, varString) => {
                const varMatch = varString.match(/--(.*): ?(.*);/)
                return { ...vars, [varMatch[1]]: varMatch[2] }
              },
              {}
            )
          }
        }
      }
      if (subItem.name.match(new RegExp(`.mdx?$`))) {
        component.documentation = subItem.path
      }
      if (subItem.name.match(/(data|props)\.(json|js)?$/)) {
        component.data = subItem.path
      }
    }
    return component
  }, {})
}
function parseItems(items = [], config) {
  return items.forEach(item => {
    if (!ignoreFiles.includes(item.name)) {
      const watchFile = watchFiles.find(
        watchCase =>
          (!watchCase.type || watchCase.type === item.type) &&
          watchCase.test.test(item.name)
      )
      if (watchFile) {
        watchFile.resolve(item, config)
      } else if (item.children) {
        parseItems(item.children, config)
      }
    }
  })
}
module.exports = function(dir) {
  const tree = parseTree(dir, {
    exclude: /(node_modules|dist|lib|kit|bin|vendor|bower_components)/
  })
  const configFile = tree.children.find(child =>
    child.name.match(/tds\.config\.(js|json)/)
  )
  const webpackConfigFile = tree.children.find(child =>
    child.name.match(/webpack\.config\.js/)
  )
  const babelrc = tree.children.find(child => child.name.match(/babelrc/))
  const entry = tree.children.find(
    child =>
      child.type === 'file' &&
      child.name.match(new RegExp(`^(index|main|App).(jsx?|ts)$`, 'i'))
  )
  const docs = tree.children.find(
    child => child.type === 'directory' && child.name.match(/docs/)
  )
  let nodeModules = []
  let hasTdsUI
  let tdsUiPath
  try {
    nodeModules = fs
      .readdirSync(path.resolve(dir, 'node_modules'))
      .filter(f =>
        fs
          .lstatSync(path.join(path.resolve(dir, 'node_modules'), f))
          .isDirectory()
      )
    try {
      tdsUiPath = path.join('node_modules', '@jayway', 'tds-ui')

      hasTdsUI = !!(
        fs.lstatSync(path.resolve(dir, tdsUiPath)).isDirectory ||
        fs.lstatSync(path.resolve(dir, tdsUiPath)).isSymbolicLink
      )
    } catch (err) {
      // console.warn("tds-ui not found");
    }
  } catch (err) {
    console.warn('Node_modules not found')
  }
  const localModules = [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'graphql',
    'react-router-dom',
    'react-router',
    'react-apollo'
  ]

  const tdsConfig = configFile
    ? require(path.resolve(dir, configFile.path))
    : {}
  const config = {
    ...defaultConfig,
    ...tdsConfig,
    ...(webpackConfigFile
      ? { webpack: path.resolve(dir, webpackConfigFile.path) }
      : {}),
    ...(babelrc ? { babelrc: path.resolve(dir, babelrc.path) } : {}),
    rootFiles: fs
      .readdirSync(dir)
      .filter(f => fs.lstatSync(path.resolve(dir, f)).isFile()),
    entry: tdsConfig.entry || (entry && entry.path),
    alias: {
      ...(hasTdsUI ? { ui: path.resolve(tdsUiPath, 'src') } : {}),
      ...(tdsConfig.alias || {})
    },
    store: {
      ...(tdsConfig.store || {}),
      reducers: [
        ...((tdsConfig.store && tdsConfig.store.reducers) || []),
        ...(hasTdsUI
          ? [path.join(tdsUiPath, 'src/store/reducers/index.js')]
          : [])
      ],
      middlewares: [
        ...((tdsConfig.store && tdsConfig.store.middlewares) || []),
        ...(hasTdsUI
          ? [path.join(tdsUiPath, 'src/store/middlewares/index.js')]
          : [])
      ]
    },
    tdsUI: hasTdsUI,
    path: path.resolve(dir),
    paths: {
      root: path.resolve(dir),
      dist: path.resolve(tree.path, 'dist'),
      ...((docs && { docs: docs.path }) || {}),
      ...({ ui: tdsUiPath } || {})
    },
    // If local versions are installed, preferrably use them to prevent conflicts
    node_modules: {
      ...localModules.reduce(
        (list, module) => ({ ...list, [module]: nodeModules.includes(module) }),
        {}
      )
    }
  }
  parseItems(
    tree.children.filter(child => child.name === 'src'),
    config
  )

  if (hasTdsUI) {
    const uiTree = parseTree(path.join(tdsUiPath, 'src'))
    const uiConfig = {
      path: tdsUiPath,
      paths: {
        root: path.resolve(tdsUiPath)
      },
      src: {}
    }
    parseItems(uiTree.children, uiConfig)
    config.tdsUI = uiConfig
  }

  return config
}
