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

- `title`: Set the default document title
- `alias`: ({alias: path}) Set up aliases used in your application import statements. This might make importing components or dependencies from remote repositories easier.
- `analytics: {key}`: (UA2345678) Define your analytics key, which will be used to track page requests, and any event dispatched via (`{type: 'ANALYTICS_EVENT', name: 'name', value: value}`)
- `applicationInsights: {key}`: Sets a key by which to track any exceptions in Application Insights.
- `external: {css: ['http://...'], js: [{src: 'https://...', defer: true}]}`: Can be used to add additional scripts and stylesheets to the application
- `entry` ("src/containers/App/index.js") A full path to alternative entry file for the application. Tedious will look for an src/index.js by default or not finding that create one with routes for each view component.
- `graphql: {remoteSchemas: [{prefix: '', url: '', token: ''}]}`: An array of remote graphQL endpoint which to fetch and serve as our own. By adding a prefix, any root query will be prefixed.

- `server: ({port: 4444, host: "localhost", publicPath: '/'})` Set up server settings
- `webpack: ({dev: '', prod: ''})`: set up path to custom webpack configs, to used on top of default, default will look for `/webpack.dev.js`, `/webpack.prod.js` or `/webpack.config.js`

```
module.exports = {
  title: 'My awesome project',
  analytics: {key: 'UA123'},
  applicationInsights: {key: 'AI123'},
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
          'https://api-euwest.graphcms.com/v1/cjng2h1rr1aha01ijg503fnjj/master',
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJ0b2tlbklkIjoiYzViMmY1OGMtODg4MC00N2NmLWI3NTgtMGJmNjIyMzdlMDA5In0.ZO9zHkbxQQbT8s56hAuFhHOyIriTVc864_yWWYrWib8'
      }]
  },
  server: {
    port: 4444,
    host: "localhost",
    publicPath: '/'
  }
}
```
