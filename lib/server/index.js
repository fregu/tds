const Koa = require("koa");
const path = require("path");
const historyFallback = require("koa2-history-api-fallback");
const serve = require("koa-static");
const mount = require("koa-mount");
const compress = require("koa-compress");
const helmet = require("koa-helmet");
const requireFromString = require("require-from-string");
const builder = require("../build");
const parser = require("../parser");
const fs = require("fs");
const MemoryFileSystem = require("memory-fs");
const mime = require("mime-types");
const websockify = require("koa-websocket");

let assets = []; // appended with any webpacked assets
let serverAssets = [];
let htmlTemplate = "<html></html>"; // replaced by webpacked index.html
let ssrRender; // Replaced by webpacked ssr entry
let broadcaster = () => {}; // replaced by websocket messaging

module.exports = async function createServer(config) {
  const {
    mode = "developent",
    server: { host = "localhost", port = 4000, publicPath = "/" } = {}
  } = config;

  const isDev = mode !== "production";
  const app = websockify(new Koa());
  const fileSystem = isDev ? new MemoryFileSystem() : fs;

  let devWatcher;
  let notReady;

  const waitForIt = () =>
    new Promise((resolve, reject) => {
      let notReadyInterval;
      notReadyInterval = setInterval(() => {
        if (!notReady) {
          clearInterval(notReadyInterval);
          resolve(true);
        }
      }, 500);
    });

  if (config.db) {
    // const initDB = require(../mongoDB)
    // initDB()
  }
  // Set up file watcher and build bundles for browser and SSR
  if (isDev) {
    notReady = true;
    const requireFromString = require("require-from-string");
    browserWatcher = builder()
      .dev(fileSystem)
      .watch(
        {
          ignored: ["dist", "node_modules"]
        },
        stats => {
          const { buildAssets, changedFiles = [] } = stats;
          console.log("changedFiles", changedFiles);

          assets = [...new Set([...assets, ...buildAssets])];

          if (buildAssets.includes("index.html")) {
            htmlTemplate = fileSystem.readFileSync(
              path.resolve(config.paths.dist, "index.html"),
              "utf-8"
            );
          }
          if (buildAssets.includes("ssr.js")) {
            const ssrContent = fileSystem.readFileSync(
              path.resolve(config.paths.dist, "ssr.js"),
              "utf-8"
            );

            ssrRender = requireFromString(ssrContent, "ssr.js").default;
          }

          notReady = false;

          if (buildAssets.includes("ssr.js")) {
            broadcaster({ type: "TDS_CLIENT_RELOAD" });
          } else if (
            changedFiles.find(file => file.match(/\.(s?css|styl|less)$/))
          ) {
            broadcaster({ type: "TDS_CLIENT_UPDATE_STYLE" });
          }
        }
      );
    //
    // serverWatcher = builder()
    //   .server(fileSystem)
    //   .watch(
    //     {
    //       ignored: ["dist", "node_modules"]
    //     },
    //     stats => {
    //       const { buildAssets, changedFiles = [] } = stats;
    //       serverAssets = [...new Set([...serverAssets, ...buildAssets])];
    //
    //       if (buildAssets.includes("ssr.js")) {
    //         const ssrContent = fileSystem.readFileSync(
    //           path.resolve(config.paths.dist, "ssr.js"),
    //           "utf-8"
    //         );
    //
    //         ssrRender = requireFromString(ssrContent, "ssr.js").default;
    //       }
    //
    //       notReady = false;
    //
    //       if (buildAssets.includes("ssr.js")) {
    //         broadcaster({ type: "TDS_CLIENT_RELOAD" });
    //       }
    //     }
    //   );
  }

  // Web socket middleware to set up client messaging and broadcaster function
  app.ws.use(function(ctx, next) {
    ctx.websocket.send("Hello World");
    ctx.websocket.on("message", function(message) {
      // do something with the message from client
      console.log(message);
    });
    broadcaster = message =>
      ctx.websocket.send(
        typeof message !== "string" ? JSON.stringify(message) : message
      );
    return next();
  });

  // Hold requersts until first build is finished
  app.use(async (ctx, next) => {
    if (notReady) {
      console.log("Wait until bundle is ready");
      await waitForIt();
    }
    return next();
  });
  if (config.graphql) {
    const { ApolloServer } = require("apollo-server-koa");
    const createGraphQLSchema = require("./graphql");

    // Get DBSchemas to merge if config.db

    const schema = await createGraphQLSchema(config); // , DBSchemas)
    if (schema) {
      const apollo = new ApolloServer({
        schema: schema,
        context: ({ ctx }) => ctx,
        introspection: true,
        playground: true
      });
      config.graphql.endpoint = `http://${host}${
        port ? `:${port}` : ""
      }/graphql`;
      apollo.applyMiddleware({ app, path: "/graphql" });
    }
  }

  // Route sub-routes to same index.html
  app.use(historyFallback());

  if (isDev) {
    // Serve assets from memory-fs
    app.use((ctx, next) => {
      const assetMatch = assets.find(a => ctx.path === `${publicPath}${a}`);
      if (assetMatch) {
        ctx.status = 200;
        ctx.type = mime.contentType(assetMatch);
        ctx.body = fileSystem.readFileSync(
          path.resolve(config.paths.dist, assetMatch)
        );
      }
      return next();
    });
  }
  // Serve real files from dist folder
  app.use(mount(publicPath, serve(config.paths.dist)));

  // Server side rendered app
  app.use(async (ctx, next) => {
    if (ctx.path === `${publicPath}index.html` && ssrRender) {
      ctx.type = "text/html";
      ctx.status = 200;
      const html = ssrRender
        ? await ssrRender(
            {
              ...config,
              server: {
                ...(config.server || {}),
                socketEndpoint: `ws://${host}:${port}`
              }
            },
            htmlTemplate,
            ctx
          )
        : fileSystem.readFileStream(
            path.resolve(config.paths.dist, "index.html")
          );
      ctx.body = html;
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on http://${host}${port ? `:${port}` : ""}`);
  });
};
