module.exports = function nullToUndefined(value) {
  console.log('nullToUndefined', value)
  if (typeof value === 'object') {
    return Object.keys(value).reduce(
      (obj, key) => ({
        ...obj,
        [key]: nullToUndefined(value[key])
      }),
      {}
    )
  }
  if (Array.isArray(value)) {
    return value.map(nullToUndefined)
  }
  if (value === null) {
    return undefined
  }
  return value
}
