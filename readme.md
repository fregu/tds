# Jayway - Tedious Design System (tds)

Tedious is a toolkit, mindset and service focusing on handling the tedious parts of web development, leaving all the fun to the developers.

It handles bundling stylesheets, scripts and assets using webpack and a predefined (but exendable) config for development and production.

It handles rendering the application server side (SSR)

It adds custom Hot Module Reloading on top of SSR.

It parses your application code structure to identify components, containers, view, patterns, redux handler, graphQL types and resolvers. And serves it with no config as a fully functional application.

Besides it parses all components and serves them in a syleguide (using React Styleguidist)

It sets up a GraphQL server with playground, serving any resolvers in the project folder, but also acts as a proxy, stitching remote GraphQL endpoints to serve them all from a single endpoint.

It sets up Redux, with some built in recucers and middlewares to help you get started, like analytics tracking and screen size.

It also serves a CLI with tools from bundling assets, watching for changes, running the application or ejecting the entire setup as part of your project.

Without any config any component within the `src/views` folder will automatically be served as separate urls `src/views/Start` -> `/`, `src/views/About` -> `/about`, `src/views/about/me` -> `/about/me`.

By adding a `data.json` or `data.js` along with the view file, it will automatically cen loaded as default props, allowing for rapid prototyping.

And it is if needed configurable to get the expected bahaviours.

## tds.config.js

- `title`: Set the default document title and PWA app title
- `version`: define a version of your app, which will be appended to any PWA-cache
- `shortTitle`: Shorter title to use instead of title when installed on homescreen
- `description`: Set meta description of application
- `lang`: Define the language of your app
- `icon`: Set relative path to a large icon-file that will be used in generating favicons, touch icons and PWA-icons
- `themeColor: '#3f5b57'`: Define a theme color for app, used in app capable PWA apps
- `backgroundColor: '#f2f6f3'`: Define a backgroundcolor used in splash-screen and on favicons (is transparent background)
- `cacheStrategy: 'NetworkFirst'`:(`NetworkFirst`,`NetworkOnly`,`CacheFirst`) Tell Tedious how to handle GET-requests and cache responses and assets, allowing to take you app to a truly offline PWA experience
- `alias`: ({alias: path}) Set up aliases used in your application import statements. This might make importing components or dependencies from remote repositories easier. Per default Tedious is using your `src` directory as primary root when importing components. And when using @jayway/tds-ui `ui` is the primary root to src directory in tds-ui.
- keys { : This is where we define keys to external tracking aplications such as analytics, tag manager and application insights
  - `analytics: "G-123456789"`: Define your analytics key, which will automatically be used to track page requests, and any event dispatched via (`{type: 'ANALYTICS_EVENT', name: 'name', value: value}`). When using tds-ui components such as `<Link />`, `<Button />`, `<Form />` and `<View />`, they provide easy event tracking by properties such as `trackClick={'eventName'} trackChange={'eventName'} trackSubmit={'eventName'} trackPage={'eventName'}`
  - `applicationInsights: {key}`: Sets a key by which to track any thrown error exceptions from both server and client to Application Insights.
    }
- `external: {css: ['http://...'], js: [{src: 'https://...', defer: true}]}`: Can be used to add additional scripts and stylesheets to the application
- `entry` ("src/containers/App/index.js") A full path to alternative entry file for the application. Tedious will automatically look for an `src/index.js` or `src/App.js` by default, or not finding that create an automatic entry with routes for each view component.
- `auth {password: 'secretpass'}`: Prevent anyone accessing you app without giving the secret password
- `graphql: {remoteSchemas: [{prefix: '', url: '', token: ''}]}`: An array of remote graphQL endpoint which to fetch and serve as our own. By adding a prefix, any root query will be prefixed.
- `server: ({port: 4444, host: "localhost", publicPath: '/'})` Set up server settings
- `webpack: ({dev: '', prod: ''})`: set up path to custom webpack configs, to used on top of default, default will look for `/webpack.dev.js`, `/webpack.prod.js` or `/webpack.config.js`

```
module.exports = {
  title: 'My awesome project',
  keys: {
    analytics: 'G-123',
    applicationInsights: 'AI123'
  },
  alias: {
    tds: "@jayway/tds",
    ui: "@jayway/ui/src"
  },
  entry: "src/App.js",
  graphql: {
    remoteSchemas: [
      {
        prefix: 'cms',
        url:
          'https://api-euwest.graphcms.com/1234',
        token:
          'eyJ0eXAiOiJKV1...'
      }]
  },
  server: {
    port: 4444,
    host: "localhost",
    publicPath: '/'
  }
}
```

## Parsing you application

Tedious will parse your application directory, automatically finding directories and files to figure out how to start up your application.

- `webpack.config.js, webpack.dev.js, webpack.prod.js`: If any webpack config is found in your root, thees will be exteded to the build
- `.babelrc, babelrc.js`: Extend the babel plugins and preset from your local babel configs.
- `graphql.types`: Automatically build a graphQl schema based on your .gql files in `src/gql/types`, unless you provide a schema
- `graphql.resolvers`: Automatically build attacj resolvers based on any .js files in `src/gql/resolvers` directory, unless you provide a schema
- `graphql.schema`: If you have a schema file, this will be used instead of generating one based on types and resolver `src/gql/schema.js`

- `redux.middlewares`: Find any js files in the directory `src/store/middlewares` and use them when generating a store, unless a store is provided
- `redux.reducers`: Find any js files in the directory `src/store/reduces` and use them to create a store, unless a store is provided
- `redux.store`: If the file `src/store/index.js` or `src/store/store.js` is provided, use this instead of generating a new store.

- `server.middlewares`: Import any js file in `src/server/middlewares` and add as a koa server middleaware
