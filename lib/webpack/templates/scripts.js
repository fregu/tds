module.exports = scripts => `
${scripts
  .map(
    script => `export * from '${process.cwd()+'/'+script}'
`
  )
  .join('')}`
