const reactDocs = require('react-docgen')
const parseProps = content => {
  let props
  try {
    props = reactDocs.parse(content)
  } catch {
    // no props found
  }
  return props
}

module.exports = parseProps
