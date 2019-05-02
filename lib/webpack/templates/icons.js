const path = require("path");
module.exports = function(source, appIcons, config) {
  return `${source}
${Object.keys(appIcons).map(
  iconName =>
    `export {default as ${iconName}} from '${path.resolve(
      config.path,
      appIcons[iconName]
    )}';
    `
).join(`
`)}
`;
};
