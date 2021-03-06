const path = require('path')
const config = require('../config')()
const loaders = require('./loaders.js')
const nodeModulesPath = require('node_modules-path')
// const webpack = require('webpack')
const merge = require('webpack-merge')
const PnpWebpackPlugin = require('pnp-webpack-plugin')

const localWebpackConfig = config.webpack ? require(config.webpack) : {}
const isSymlinked =
  nodeModulesPath() !== path.resolve(process.cwd(), 'node_modules')

// Make sure project and tedious uses same instance of modules
const localModules =
  (isSymlinked && [
    'react',
    'react-dom',
    'react-router-dom',
    'react-router',
    'react-redux',
    'react-helmet'
  ]) ||
  []
// If project imports graphql use same version as TDS uses to prevent conflicts
const tdsModules =
  (isSymlinked && [
    'graphql',
    '@apollo',
    '@apollo/client',
    '@apollo/react-ssr',
    '@apollo/react-hooks',
    '@apollo/react-components',
    '@apollo/react-hoc',
    '@apollo/react-common'
  ]) ||
  []

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
      '@babel/preset-flow',
      '@babel/preset-typescript'
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
      ['styled-jsx/babel', {}],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-optional-chaining'
    ]
  }
}

module.exports = mode =>
  merge(localWebpackConfig, {
    node: {
      fs: 'empty'
    },
    mode,

    resolveLoader: {
      modules: [
        path.resolve(process.cwd(), 'node_modules'),
        path.resolve(nodeModulesPath()),
        path.resolve(__dirname, 'loaders')
      ],
      extensions: ['.js', '.json', '.ts'],
      mainFields: ['loader', 'main'],
      plugins: [PnpWebpackPlugin.moduleLoader(module)]
    },
    resolve: {
      alias: {
        ...(tdsModules.reduce(
          // maybe this is not enough to ensure node_module path.. :/
          (set, module) => ({
            ...set,
            ...(nodeModulesPath(module)
              ? { [module]: path.resolve(nodeModulesPath(module), module) }
              : {})
          }),
          {}
        ) || {}),
        ...(localModules.reduce(
          (set, module) => ({
            ...set,
            ...(config.nodeModules.includes(module) || nodeModulesPath(module)
              ? {
                  [module]: config.nodeModules.includes(module)
                    ? path.resolve(process.cwd(), 'node_modules', module)
                    : path.resolve(nodeModulesPath(module), module)
                }
              : {})
          }),
          {}
        ) || {})
      },
      plugins: [PnpWebpackPlugin]
    },
    // resolve: {
    //   mainFields: ['svelte', 'browser', 'module', 'main']
    // },
    module: {
      rules: [
        ...loaders(config),
        {
          test: /reducers-loader$/,
          exclude: /node_modules/,
          use: {
            loader: 'scripts',
            options: {
              scripts: []
            }
          }
        },
        {
          test: /scripts-loader$/,
          exclude: /node_modules/,
          use: {
            loader: 'scripts'
          }
        },

        // { test: /\.json$/, loader: "json-loader" },

        {
          test: /\.(j|t)sx?$/, // handle .js, .jsx or .ts or even .tsx
          exclude: /node_modules/,
          // exclude: /node_modules(\\\\|\/)((?!@jayway(\\\\|\/)tds-ui).)*$/,
          // exclude: /node_modules(\\\\|\/)(?!(@jayway(\\\\|\/)tds.*)\/).*/,
          use: [babelLoader]
        },
        {
          test: /tds(-ui)?.*\.(j|t)sx?$/, // handle .js, .jsx or .ts or even .tsx
          exclude: /tds(-ui)?(\\\\|\/)node_modules/,
          use: [babelLoader]
        },
        // {
        //   test: /\.(html|svelte)$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'svelte-loader',
        //     options: {
        //       emitCss: true
        //     }
        //   }
        // },
        // working with node modules .mjs is a common type we also need to handle
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        },
        {
          test: /\.mdx?$/,
          use: [
            babelLoader,
            {
              loader: '@mdx-js/loader',
              options: {
                renderer: `
            import React from 'react'
            import { mdx } from '@mdx-js/react'
          `
              }
            }
          ]
        },
        // {
        //   test: /\.md$/,
        //   use: ['html-loader', 'markdown-loader']
        // },
        {
          test: /\.css$/,
          use: [
            require('mini-css-extract-plugin').loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('postcss-import')({
                    path: ['src/base', 'src'],
                    skipDuplicates: true
                  }),
                  require('postcss-for'),
                  require('postcss-mixins')({
                    mixins: {
                      prefix: (mixin, dir) => {}
                    }
                  }),

                  require('postcss-color-mod-function')(),
                  require('postcss-preset-env')({
                    features: {
                      'nesting-rules': true,
                      'custom-media-queries': true
                    }
                  })
                ],
                sourceMap: false,
                ident: 'postcss'
              }
            }
          ]
        },
        {
          test: /\.style.(j|t)sx?$/,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { importLoaders: 2 } },
            { loader: 'postcss-loader', options: { parser: 'postcss-js' } },
            'babel-loader'
          ]
        },
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader'
        },
        {
          test: /\.(woff|woff2|(o|t)tf|eot)$/i,
          loader: 'file-loader',
          options: {
            name: 'fonts/[folder]/[name].[ext]'
          }
        },
        {
          test: /\.(jpe?g|png)$/i,
          exclude: /icons/,
          use: [
            {
              loader: 'responsive-loader',
              options: {
                sizes: [2000, 1200, 600, 300],
                placeholder: true,
                placeholderSize: 50,
                disable: mode === 'development'
              }
            },
            'image-webpack-loader'
          ]
        },
        {
          test: /\.gif$/i,
          exclude: /icons/,
          use: ['image-webpack-loader']
        },
        {
          // SVGs imported from images folder will return image URL instead on inline SVG object
          test: /\.svg$/i,
          include: /images|img/,
          use: 'file-loader'
        },
        {
          test: /\.svg$/i,
          exclude: /images|img/,
          use: [
            {
              loader: require.resolve('svg-inline-loader')
              // options: {
              //   removeTags: true,
              //   removeSVGTagAttrs: true,
              //   removingTagAttrs: [],
              //   idPrefix: 'icon'
              // }
            }
          ]
        }
      ]
    },
    plugins: [
      PnpWebpackPlugin
      // new webpack.IgnorePlugin(/\/iconv-loader$/),
      // new ManifestPlugin({ fileName: 'manifest.json' })
      // new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop')
    ]
  })
