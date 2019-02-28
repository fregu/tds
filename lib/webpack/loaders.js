module.exports = config => {
  // console.log(config);
  return [
    {
      test: /loaders\/config.js$/,
      use: [
        "babel-loader",
        {
          loader: "config",
          options: config
        }
      ]
    },
    {
      test: /readme-loader!/,
      use: [
        "babel-loader",
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
        "babel-loader",
        {
          loader: "routes",
          options: config
        }
      ]
    },
    {
      test: /loaders\/components.js$/,
      use: [
        "babel-loader",
        {
          loader: "components",
          options: config
        }
      ]
    },
    {
      test: /loaders\/graphql-resolvers.js$/,
      use: [
        "babel-loader",
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
        "babel-loader",
        {
          loader: "reducers",
          options: config
        }
      ]
    },
    {
      test: /loaders\/middlewares.js$/,
      use: [
        "babel-loader",
        {
          loader: "middlewares",
          options: config
        }
      ]
    }
  ];
};
