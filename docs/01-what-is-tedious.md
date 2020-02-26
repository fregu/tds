# What is Tedious (@jayway/tds)

Tedious was created to handle all "tedious" parts of web development that you usually need to do over and over again. Things like creating a build pipeline, asset bundle optimization, HTTP server, GraphQL server, redux setup, styleguide etc.

What if we can hide most of this the complexity and let developers focus on creating beautiful UIs instead.

@jayway/tds is a dependency which is installed in your project which add the tools to get started quickly.

Tedious is supposed to be a optional zero config toolkit, without limitations to the defaults. Thats why most parts of tedious can be configured or replaced without writing everything from scratch.

## The parser

Tedius parses all files in your project to identify the structure and scale of your project, and whether there are any configuration it needs to take into account.

- Tedious config [tds.config.js]
  The main configuration file for configuring your project, read more in configuring Tedious
- Webpack config [webpack.config.js]
  Any webpack config file in you project will automatically be added in the build pipeline, along with default webpack config setup
- Babel config [babelrc.js]
  Any specific babel configuration will be merged with the default configuration
- Entry file [src/index.js, src/App.js]
  If no entry file is found (or defined in tds.config.js) Tedious will create an invisible entry file with automatic routes for any UI component in the directory [views, pages]
- Graphql schema [src/gql/index.js, src/graphql/schema.js, ...]
  If any schema file is found this will be added to the graphql server. If no schema is found (but types and resolvers exist) an schema will automatically be created.
- Graphql types [src/gql/types/\*.gql, src/graphql/types/\*.graphql]
  Any .gql file in the folder types will be added to the TypeDef definition in the graphql-schema (only if no schema file is found)
- Graphql resolvers [src/gql/resolvers.js, src/gql/resolvers/\*.js]
  Any .js file found in the folder resolvers, will be added to the graphql schema (only if no schema file was found)
- Redux creator [src/store/index.js, src/redux/store.js]
  Create a Redux instance with this file, if no store creator was found it will automatically be created to serve any reducers or middlewares found.
- Redux reducers [src/store/reducers.js, src/redux/reducers\*.js]
  Any .js file found in the folder reducers will be imported as a reducer and added to the store (only if no store creator was found).
- Redux middlewares [src/store/middlewares.js, src/redux/middlewares\*.js]
  Any .js file found in the folder middlewares wil automatically be hooked up to the store (only if no store creator was found).
- Server middlewares [src/server/middlewares.js, src/server/middlewares/\*.js]
  Any js file in the folder middlewares will be added to the koa-server pipeline where we can hook into the flow for authentication, custom error handling or session variable mamangement.
- Server cronJobs [src/server/cron.js]  
   If the file cron.js is found it will be used to schedule intervalled tasks from the server following the cron tab syntax as keys in the object eg.

  ```js
  module.exports = {
    '* * * * * *': () => {
      /* do something */
    }
  }
  ```

  Beside configurations and middlewares, tedious also parses any UI component to identify how to present it best in the tds-styleguide.

## The command line interface

## The builder

## The server

## The styleguide
