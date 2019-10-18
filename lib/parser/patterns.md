```
{
  path: '/sites/site',
  webpack: 'webpack.config.js',
  babel: '.babelrc',
  entry: 'App.js',
  css: {
    vars: {},
  },
  documentation: [
    {
      name: 'Installation',
      path: 'docs',
      fullPath: 'Sites/myProject/docs',
      documentation: 'installation.md'
    }
  ],
  src: {
    assets: [{}],
    base: [{
      name: 'color',
      path: 'src/base',
      fullPath: 'Sites/myProject/src/base'
      style: 'color.css',
      documentation: 'color.md',
      files: ['color.css', 'color.md']
    }],
    components: [{
      name: 'Button',
      path: 'src/components/Button',
      fullPath: 'Sites/myProject/src/components/Button'
      main: 'index.js',
      style: 'index.css',
      documentation: 'readme.md',
      data: 'data.json',
      tests: 'specs.js',
      props: {},
      css: {
        imports: [],
        vars: {},
        usedVars: []
      },
      files: ['index.js', 'index.css', 'readme.md', 'specs.js', 'data.json']
    }],
    containers: [{}],
    helpers: [{
      name: Connect,
      path: 'src/helpers',
      fullPath: 'Sites/myProject/src/components/Connect'
      main: 'Connect.js',
      documentation: 'Connect.md',
      files: ['Connect.js', 'Connnect.md']
    }],
    views: [{}]
  },
  ui: {
    assets: [{}],
    base: [{}],
    components: [{
      name: 'Button',
      path: 'ui/components/Button',
      fullPath: 'node_modules/@jayway/tds-ui/src/components/Button'
      main: 'index.js',
      style: 'index.css',
      documentation: 'readme.md',
      data: 'data.json',
      tests: 'specs.js',
      props: {},
      css: {
        imports: [],
        vars: {},
        usedVars: []
      },
      files: ['index.js', 'index.css', 'readme.md', 'specs.js', 'data.json']
    }],
    containers: [{}],
    helpers: [{
      name: Connect,
      path: 'src/helpers',
      main: 'Connect.js',
      documentation: 'Connect.md',
      files: ['Connect.js', 'Connnect.md']
    }],
    views: [{}]
  },
  store: {
    actions: [],
    reducers: [],
    middlewares: []
  },
  graphql: {
    types: [],
    resolvers: []
  },
  server: {
    publicPath: '/',
    dist: '/dist',
  },
  nodeModules: []
}
```
