const parseCSS = content => {
  return {
    imports: [
      ...(content.match(/@import ["'](.*)["']/g) || []).reduce(
        (imports, importString) => {
          const importMatch = importString.match(/@import ["'](.*)["']/)
          return [...imports, importMatch[1]]
        },
        []
      )
    ],
    variables: {
      ...(content.match(/--(.*): ?(.*);/g) || []).reduce((vars, varString) => {
        const varMatch = varString.match(/--(.*): ?(.*);/)
        return { ...vars, [varMatch[1]]: varMatch[2] }
      }, {})
    }
  }
}

module.exports = parseCSS
