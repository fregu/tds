const path = require("path");
const config = require("../config");
const loaders = require("./loaders.js");
const ManifestPlugin = require("webpack-manifest-plugin");
const localModules = [
  "react-router-dom",
  "react-router",
  "react-redux",
  "react-apollo",
  "graphql"
];
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
            ...(localModules.reduce(
              (set, module) => ({
                ...set,
                [module]: config.node_modules[module]
                  ? path.resolve(process.cwd(), "node_modules", module)
                  : path.resolve(__dirname, "..", "..", "node_modules", module)
              }),
              {}
            ) || {}),
            ...(config.alias || {})
          }
        }
      ],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      "@babel/plugin-proposal-optional-chaining"
    ]
  }
};
module.exports = mode => ({
  mode,
  resolveLoader: {
    modules: [
      path.resolve(__dirname, "..", "..", "node_modules"),
      path.resolve(__dirname, "loaders")
    ],
    extensions: [".js", ".json"],
    mainFields: ["loader", "main"]
  },
  module: {
    rules: [
      ...loaders(config),
      {
        test: /reducers-loader$/,
        exclude: /node_modules/,
        use: {
          loader: "scripts",
          options: {
            scripts: []
          }
        }
      },
      {
        test: /scripts-loader$/,
        exclude: /node_modules/,
        use: {
          loader: "scripts"
        }
      },

      //{ test: /\.json$/, loader: "json-loader" },

      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!(@rb)\/).*/,
        use: [
          babelLoader
          //"react-hot-loader/webpack"
        ]
      },
      // working with node modules .mjs is a common type we also need to handle
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      },
      {
        test: /.mdx$/,
        use: [babelLoader, "@mdx-js/loader"]
      },
      {
        test: /\.css$/,
        use: [
          // mode === "development"
          //   ? "style-loader"
          "classnames-loader",
          require("mini-css-extract-plugin").loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("postcss-import")({
                  path: ["src/base", "src"],
                  skipDuplicates: true
                }),
                require("postcss-preset-env")({
                  features: {
                    "nesting-rules": true,
                    "custom-media-queries": true
                  }
                })
              ],
              sourceMap: true,
              ident: "postcss"
            }
          }
        ]
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader"
      },
      {
        test: /\.(woff|woff2|(o|t)tf|eot)$/i,
        loader: "file-loader",
        query: {
          name: "fonts/[name].[hash].[ext]"
        }
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        exclude: /icons/,
        use: [
          {
            loader: "file-loader",
            query: {
              name: "img/[name].[hash].[ext]"
            }
          },
          "image-webpack-loader"
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve("svg-inline-loader"),
            options: {
              removeTags: true,
              removeSVGTagAttrs: true,
              removingTagAttrs: ["stroke", "id"],
              idPrefix: "icon"
            }
          }
        ]
      }
    ]
  },
  plugins: [new ManifestPlugin({ fileName: "manifest.json" })]
});
