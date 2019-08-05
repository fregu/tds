const path = require('path')
const localModules = [
  'react',
  'react-dom',
  'react-router-dom',
  'react-router',
  'react-redux',
  'react-apollo',
  'graphql'
]
module.exports = config => {
  const babelLoader = {
    loader: 'babel-loader',
    options: {
      // Ignore the .babelrc at the root of our project-- that's only
      // used to compile our webpack settings, NOT for bundling
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            // Enable tree-shaking by disabling commonJS transformation
            modules: false,
            corejs: 2,
            targets: {
              browsers: '> 0.25%, not dead',
              node: true
            },
            useBuiltIns: 'entry'
          }
        ],
        // Transpile JSX code
        '@babel/preset-react',
        '@babel/preset-flow'
      ],
      plugins: [
        [
          'module-resolver',
          {
            root: [path.resolve(process.cwd(), 'src')],
            alias: {
              root: process.cwd(),
              src: path.resolve(process.cwd(), 'src'),
              ...(localModules.reduce(
                (set, module) => ({
                  ...set,
                  [module]: config.node_modules[module]
                    ? path.resolve(process.cwd(), 'node_modules', module)
                    : path.resolve(
                        __dirname,
                        '..',
                        '..',
                        'node_modules',
                        module
                      )
                }),
                {}
              ) || {}),
              ...(config.alias || {})
            }
          }
        ],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-optional-chaining'
      ]
    }
  }
  // console.log(config);
  return [
    {
      test: /loaders\/config.js$/,
      use: [
        babelLoader,
        {
          loader: 'config',
          options: config
        }
      ]
    },
    {
      test: /loaders\/serverConfig.js$/,
      use: [
        babelLoader,
        {
          loader: 'serverConfig',
          options: config
        }
      ]
    },
    {
      test: /loaders\/appEntry.js$/,
      use: [
        babelLoader,
        {
          loader: 'appEntry',
          options: config
        }
      ]
    },
    {
      test: /loaders\/styleguideEntry.js$/,
      use: [
        babelLoader,
        {
          loader: 'styleguideEntry',
          options: config
        }
      ]
    },
    {
      test: /loaders\/componentLoader.js$/,
      use: [
        babelLoader,
        {
          loader: 'componentLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reactLoader.js$/,
      use: [
        babelLoader,
        {
          loader: 'reactLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reduxLoader.js$/,
      use: [
        babelLoader,
        {
          loader: 'reduxLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reactReduxLoader.js$/,
      use: [
        babelLoader,
        {
          loader: 'reactReduxLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reactRouterLoader.js$/,
      use: [
        {
          loader: 'reactRouterLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reactRouterDomLoader.js$/,
      use: [
        {
          loader: 'reactRouterDomLoader',
          options: config
        }
      ]
    },
    {
      test: /assets\/icons.js$/,
      use: [
        // {
        //   loader: require.resolve("svg-inline-loader"),
        //   options: {
        //     removeTags: true,
        //     removeSVGTagAttrs: true,
        //     removingTagAttrs: ["stroke", "id"],
        //     idPrefix: "icon"
        //   }
        // },
        // babelLoader,
        {
          loader: 'iconsLoader',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reactApolloLoader.js$/,
      use: [
        {
          loader: 'reactApolloLoader',
          options: config
        }
      ]
    },
    {
      test: /readme-loader!/,
      use: [
        babelLoader,
        'mdx-loader',
        {
          loader: 'readme',
          options: config
        }
      ]
    },
    {
      test: /loaders\/routes.js$/,
      use: [
        babelLoader,
        {
          loader: 'routes',
          options: config
        }
      ]
    },
    {
      test: /loaders\/components.js$/,
      use: [
        babelLoader,
        {
          loader: 'components',
          options: config
        }
      ]
    },
    {
      test: /loaders\/graphqlResolvers.js$/,
      use: [
        babelLoader,
        {
          loader: 'graphqlResolvers',
          options: config
        }
      ]
    },
    {
      test: /loaders\/graphqlTypes.js$/,
      use: [
        {
          loader: 'raw-loader'
        },
        {
          loader: 'graphqlTypes',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reduxReducers.js$/,
      use: [
        babelLoader,
        {
          loader: 'reduxReducers',
          options: config
        }
      ]
    },
    {
      test: /loaders\/reduxMiddlewares.js$/,
      use: [
        babelLoader,
        {
          loader: 'reduxMiddlewares',
          options: config
        }
      ]
    },
    {
      test: /loaders\/serverMiddlewares.js$/,
      use: [
        babelLoader,
        {
          loader: 'serverMiddlewares',
          options: config
        }
      ]
    }
  ]
}
