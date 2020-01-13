const path = require('path')

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
      test: path.resolve(__dirname, 'loaders', 'config.js'),
      use: [
        babelLoader,
        {
          loader: 'config',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'serverConfig.js'),
      use: [
        babelLoader,
        {
          loader: 'serverConfig',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'appEntry.js'),
      use: [
        babelLoader,
        {
          loader: 'appEntry',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'styleguideEntry.js'),
      use: [
        babelLoader,
        {
          loader: 'styleguideEntry',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'componentLoader.js'),
      use: [
        babelLoader,
        {
          loader: 'componentLoader',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reactLoader.js'),
      use: [
        babelLoader,
        {
          loader: 'reactLoader',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reduxLoader.js'),
      use: [
        babelLoader,
        {
          loader: 'reduxLoader',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reactReduxLoader.js'),
      use: [
        babelLoader,
        {
          loader: 'reactReduxLoader',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reactRouterLoader.js'),
      use: [
        {
          loader: 'reactRouterLoader',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reactRouterDomLoader.js'),
      use: [
        {
          loader: 'reactRouterDomLoader',
          options: config
        }
      ]
    },
    {
      test: /assets(\\\\|\/)icons.js$/,
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
      test: path.resolve(__dirname, 'loaders', 'reactApolloLoader.js'),
      use: [
        {
          loader: 'reactApolloLoader',
          options: config
        }
      ]
    },
    // {
    //   test: /readme-loader!/,
    //   use: [
    //     babelLoader,
    //     'mdx-loader',
    //     {
    //       loader: 'readme',
    //       options: config
    //     }
    //   ]
    // },
    {
      test: path.resolve(__dirname, 'loaders', 'routes.js'),
      use: [
        babelLoader,
        {
          loader: 'routes',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'components.js'),
      use: [
        babelLoader,
        {
          loader: 'components',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'graphqlResolvers.js'),
      use: [
        babelLoader,
        {
          loader: 'graphqlResolvers',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'graphqlSchema.js'),
      use: [
        babelLoader,
        {
          loader: 'graphqlSchema',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'graphqlTypes.js'),
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
      test: path.resolve(__dirname, 'loaders', 'reduxReducers.js'),
      use: [
        babelLoader,
        {
          loader: 'reduxReducers',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'reduxMiddlewares.js'),
      use: [
        babelLoader,
        {
          loader: 'reduxMiddlewares',
          options: config
        }
      ]
    },
    {
      test: path.resolve(__dirname, 'loaders', 'serverMiddlewares.js'),
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
