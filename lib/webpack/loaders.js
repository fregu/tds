const path = require("path");

module.exports = config => {
  const babelLoader = {
    loader: "babel-loader",
    options: {
      // Ignore the .babelrc at the root of our project-- that's only
      // used to compile our webpack settings, NOT for bundling
      babelrc: false,
      presets: [
        [
          "@babel/preset-env",
          {
            // Enable tree-shaking by disabling commonJS transformation
            modules: false,
            targets: {
              browsers: "> 0.25%, not dead"
            },
            useBuiltIns: "entry"
          }
        ],
        // Transpile JSX code
        "@babel/preset-react",
        "@babel/preset-flow"
      ],
      plugins: [
        [
          "module-resolver",
          {
            root: [path.resolve(process.cwd(), "src")],
            alias: {
              root: process.cwd(),
              src: path.resolve(process.cwd(), "src"),
              ...(config.alias || {})
            }
          }
        ],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        "@babel/plugin-proposal-optional-chaining"
      ]
    }
  };
  // console.log(config);
  return [
    {
      test: /loaders\/config.js$/,
      use: [
        babelLoader,
        {
          loader: "config",
          options: config
        }
      ]
    },
    {
      test: /loaders\/appEntry.js$/,
      use: [
        babelLoader,
        {
          loader: "appEntry",
          options: config
        }
      ]
    },
    {
      test: /readme-loader!/,
      use: [
        babelLoader,
        "mdx-loader",
        {
          loader: "readme",
          options: config
        }
      ]
    },
    {
      test: /loaders\/routes.js$/,
      use: [
        babelLoader,
        {
          loader: "routes",
          options: config
        }
      ]
    },
    {
      test: /loaders\/components.js$/,
      use: [
        babelLoader,
        {
          loader: "components",
          options: config
        }
      ]
    },
    {
      test: /loaders\/graphql-resolvers.js$/,
      use: [
        babelLoader,
        {
          loader: "graphql-resolvers",
          options: config
        }
      ]
    },
    {
      test: /loaders\/graphql-types.js$/,
      use: [
        {
          loader: "graphql-tag/loader"
        },
        {
          loader: "graphql-types",
          options: config
        }
      ]
    },
    {
      test: /loaders\/reducers.js$/,
      use: [
        babelLoader,
        {
          loader: "reducers",
          options: config
        }
      ]
    },
    {
      test: /loaders\/middlewares.js$/,
      use: [
        babelLoader,
        {
          loader: "middlewares",
          options: config
        }
      ]
    }
  ];
};
