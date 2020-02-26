module.exports = function(source, appIcons, currIcons, config) {
  return `${!(currIcons && Object.keys(currIcons).length) ? source : ''}
${Object.keys(appIcons).map(
  iconName =>
    `export {default as ${iconName.replace(/[ -]/g, '_')}} from '${appIcons[
      iconName
    ].replace(/\\/g, '\\\\')}';
    `
).join(`
`)}
`
}
