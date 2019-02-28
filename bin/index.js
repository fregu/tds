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
    case "build":
      mode = flags.includes("dev") ? "development" : "production";
      build("build", {
        mode,
        watch: false,
        styleguide: false,
        server: false
      });
      break;
    case "start":
      mode = flags.includes("prod") ? "production" : "development";
      build("devServer", {
        mode: mode,
        historyApiFallback: true,
        styleguide: true,
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
    case "server":
      mode = flags.includes("prod") ? "production" : "development";
      createServer({ ...config, mode });
      break;
  }
} else {
  console.log("available commandss...");
}
