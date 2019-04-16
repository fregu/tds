#!/usr/bin/env node

// TODO: Implement process management using PM2 API (http://pm2.keymetrics.io/docs/usage/pm2-api/)  //
const npx = require("node-npx");
const path = require("path");
const build = require("./build");
const createServer = require("../lib/server");
const config = require("../lib/config");

if (process.argv.length > 2) {
  const dir = process.cwd();
  const command = process.argv[2];
  const specifier =
    process.argv[3] && !process.argv[3].match(/^-/) && process.argv[3];
  const flags = process.argv
    .filter(arg => arg.match(/^-/))
    .map(arg => arg.replace(/^--?/, ""));

  switch (command) {
    case "init":
      console.log(
        "Setting up new Tedious project setup... not yet implemented, sorry :/"
      );
      // create tds.config.js file
      // creating basic project structure
      // installing dependencies
      // starting your application

      break;
    case "build":
      mode = flags.includes("dev") ? "development" : "production";
      build("build", {
        mode,
        watch: false,
        styleguide: false,
        server: false
      });
      break;
    case "styleguide":
      console.log(config);
      const styleguide = require("../lib/styleguide")(config);
      if (flags.includes("build")) {
        styleguide.build();
      } else {
        styleguide.serve();
      }
      break;
    case "start":
      mode = flags.includes("prod") ? "production" : "development";
      // forEach entry create server and start on separate port?
      createServer({ ...config, mode });
      break;
    case "test":
      console.log(
        "Not yet implemented, would be running your tests, lints and type testers right now otherwise"
      );
      break;
    case "cms":
      console.log("Not yet implemented, see strapi.io for manual setup");
      break;
  }
} else {
  console.log("available commands...");
}
