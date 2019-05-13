const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const appTemplate = require("../templates/appEntry");

function flattenChildren(views) {
  return views.reduce(
    (allViews, view) => [
      ...allViews,
      view,
      ...(view.children ? flattenChildren(view.children) : [])
    ],
    []
  );
}
module.exports = function(source) {
  const config = getOptions(this) || {};
  if (config.entry) {
    return fs.readFileSync(path.resolve(process.cwd(), config.entry), "utf-8");
  } else {
    return appTemplate({
      views: flattenChildren(config.src.views || []).map(view => ({
        ...view,
        route: view.path.replace(/^src\/views\//, "")
      })),
      ...config
    });
  }
};
