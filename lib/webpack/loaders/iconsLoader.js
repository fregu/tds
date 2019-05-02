const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const template = require("../templates/icons");

module.exports = function(source) {
  const currIcons = source
    .match(/export \{ ?default as (.*) ?\}/g)
    .map(source => source.match(/export \{ ?default as ([^ ]*) ?\}/)[1]);

  const config = getOptions(this) || {};
  const appIcons = Object.keys(config.src.assets.icons)
    .filter(iconName => !currIcons.includes(iconName))
    .reduce(
      (all, iconName) => ({
        ...all,
        [iconName]: config.src.assets.icons[iconName]
      }),
      {}
    );
  const newSource = template(source, appIcons, config);
  //console.log(newSource);
  return newSource;
};
