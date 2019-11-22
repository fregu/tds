module.exports = scripts => `
${scripts
  .map(
    script => `export * from '${script.replace(/\\/g, '\\\\')}'
`
  )
  .join('')}`
