const fs = require('fs')
const path = require('path')
const parseTree = require('directory-tree')
const reactDocs = require('react-docgen')
const configDefaults = require('./defaultConfig.js')
const parseProps = content => {
  let props
  try {
    props = reactDocs.parse(content)
  } catch {
    // no props found
  }
  return props
}
const parseCSS = () => {}

// TODO use this one instead
// const findComponents = items => {
//   items.reduce((components, item) => {
//     if (isComponent(item)) {
//       const component = getComponent(item)
//       return [...components, component]
//     }
//     return components
//   ], [])
// }
const isComponent = item => {
  // has (index|name).(js|css|md) children?

  return (
    item.children &&
    !!item.children.find(child =>
      child.name.match(
        new RegExp(`(index|${item.name})\\.(tsx?|jsx?|s?css|styl|mdx?)$`)
      )
    )
  )
}
const getComponent = item => {
  if (!isComponent(item)) {
    return false
  }

  const name = item.name
  const component = {
    name,
    path: item.path,
    fullPath: path.resolve(item.path),
    main: findFiles(`(index|${name})\\.(t|j)sx?$`, item, true),
    style: findFiles(`(index|${name})\\.(s?css|styl|less)$`, item, true),
    documentation: findFiles(`(index|${name}).mdx?$`, item, true),
    data: findFiles(`(index|data|${name})\\.json?$`, item, true),
    tests: findFiles(`(${name}\\.)?(tests?|specs?)\\.(t|j)sx?$`, item, true),
    files: item.children
      .filter(file => file.type === 'file')
      .map(file => ({
        ...file,
        content: fs.readFileSync(file.path, 'utf-8')
      }))
  }
  if (component.main) {
    const mainContent = fs.readFileSync(component.main, 'utf-8')
    component.props = parseProps(mainContent)
  }
  if (component.style) {
    const styleContent = fs.readFileSync(component.style, 'utf-8')
    component.css = parseCSS(styleContent)
  }
  return component
}
const findComponents = (item, components = []) => {
  // if folder {findComponents(path+folder)}
  if (!item || !item.children) {
    return components
  }

  let component = getComponent(item)

  return [
    ...components,
    ...(component ? [component] : []),
    ...item.children.reduce((childComponents, child) => {
      const baseName = child.name.replace(child.extension, '')
      if (
        child.type === 'file' &&
        !childComponents.find(comp => comp.name === baseName)
      ) {
        return [
          ...childComponents,
          getComponent({
            ...item,
            name: baseName,
            children: item.children.filter(
              c =>
                c.type === 'file' && c.name.match(new RegExp(`^${baseName}.`))
            )
          })
        ]
      } else if (child.type === 'directory') {
        return [...childComponents, ...findComponents(child, components)]
      }
      return components
    }, [])
  ]
}
const findFiles = (fileMatch, tree, single) => {
  const files = (
    (tree &&
      tree.children &&
      tree.children.filter(
        child =>
          child.name.match(new RegExp(fileMatch)) && child.type === 'file'
      )) ||
    []
  ).map(file => file.path)
  return single ? files[0] || false : files
}

const findDirectories = (folderMatch, tree, single) => {
  const dirs =
    (tree &&
      tree.children &&
      tree.children.filter(
        child =>
          child.name.match(new RegExp(folderMatch)) &&
          child.type === 'directory'
      )) ||
    []
  return single ? dirs[0] || false : dirs
}

const resolveTreePath = (tree, firstArg, ...restArgs) => {
  // step through args and test any regexp on all children
  if (tree.children && firstArg) {
    const childMatch = tree.children.find(child =>
      child.name.match(new RegExp(firstArg))
    )
    // parse deeper
    if (childMatch && restArgs.length) {
      return resolveTreePath(childMatch, ...restArgs)
    }
    // or return match
    return childMatch
  } else if (!firstArg) {
    // If mor path return tree
    return tree
  }
  // Or no match
  return false
}
const setRelativePath = (path, importPath) => component => {
  return component.path
    ? {
        ...component,
        path: component.path.replace(path, importPath)
      }
    : component
}

const findSrc = (tree, importPath) => ({
  assets: {
    icons: findFiles(/\.svg$/, resolveTreePath(tree, 'assets?', 'icons')),
    images: findFiles(
      /\.(jpe?g|png|gif|svg|webm)/,
      resolveTreePath(tree, 'assets', /(imgs?|images?)/)
    ),
    fonts: findFiles(
      /\.(woff|woff2|svg|eot|otf)$/,
      resolveTreePath(tree, 'assets', /fonts?/)
    )
  },
  patterns: findComponents(resolveTreePath(tree, /base|patterns/))
    .filter(Boolean)
    .map(setRelativePath(tree.path + '/', importPath)),
  components: findComponents(resolveTreePath(tree, /components|bricks/))
    .filter(Boolean)
    .map(setRelativePath(tree.path + '/', importPath)),
  containers: findComponents(resolveTreePath(tree, /containers|modules|kits/))
    .filter(Boolean)
    .map(setRelativePath(tree.path + '/', importPath)),
  helpers: findComponents(resolveTreePath(tree, /helpers|utils/))
    .filter(Boolean)
    .map(setRelativePath(tree.path + '/', importPath)),
  views: findComponents(resolveTreePath(tree, /views|pages/))
    .filter(Boolean)
    .map(setRelativePath(tree.path + '/', importPath))
})
module.exports = dir => {
  const root = dir
  const tree = parseTree(root, {
    exclude: /(node_modules|dist|lib|kit|bin|vendor|bower_components)/
  })
  const nodeModulesTree = parseTree(path.join(root, 'node_modules')) || {}
  const configFile = findFiles(/tds.config.js/, tree, true)
  const config = {
    ...configDefaults,
    ...(configFile ? require(configFile) : {})
  }

  return {
    path: root,
    configFile,
    webpack:
      typeof config.webpack !== 'undefined'
        ? config.webpack
        : findFiles(/webpack.config/, tree),
    babel:
      typeof config.babel !== 'undefined'
        ? config.babel
        : findFiles(/babelrc/, tree),
    entry: config.entry || findFiles(/(index|App|app)\.(t|j)sx?$/, tree, true),
    documentation: findFiles(
      /.mdx?/,
      resolveTreePath(tree, /(docs|documentation)/) // TODO: /**/*.md globbing?
    ),
    src: findSrc(resolveTreePath(tree, 'src'), ''),
    ui: findDirectories(
      'tds-ui',
      resolveTreePath(nodeModulesTree, '@jayway'),
      true
    )
      ? findSrc(
          resolveTreePath(nodeModulesTree, '@jayway', 'tds-ui', 'src'),
          'ui'
        )
      : false,
    nodeModules: findDirectories(
      /^(react|react-dom|redux|react-redux|graphql|react-router-dom|react-router|react-apollo)$/,
      nodeModulesTree
    ).map(dir => dir.name),
    graphql: {
      queries: findFiles(
        /\.(gql|graphql)/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'queries')
      ),
      mutations: findFiles(
        /\.(gql|graphql)/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'mutations')
      ),
      types: findFiles(
        /\.(gql|graphql)$/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'types')
      ),
      resolvers: findFiles(
        /\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(gql|graphql)/, 'resolvers')
      ),
      schema: findFiles(
        /(index|schema)\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /gql|graphql/)
      ),
      ...(config.graphql || {})
    },
    redux: {
      actions: findFiles(
        /\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/, 'actions')
      ),
      middlewares: findFiles(
        /\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/, 'middlewares')
      ),
      reducers: findFiles(
        /\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/, 'reducers')
      ),
      store: findFiles(
        /(index|store)\.(j|t)sx?$/,
        resolveTreePath(tree, 'src', /(store|redux)/)
      ),
      ...(config.redux || {})
    },
    server: config.server || {}
  }
}
