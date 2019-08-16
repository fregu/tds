const fs = require('fs')
const path = require('path')
const findFiles = require('./findFiles')
const parseProps = require('./parseProps')
const parseCSS = require('./parseCss')

const isComponent = item => {
  return (
    item.children &&
    !!item.children.find(child =>
      child.name.match(
        new RegExp(`(index|${item.name})\\.(tsx?|jsx?|s?css|styl|mdx?)$`)
      )
    )
  )
}
const getComponent = item => {
  if (!isComponent(item)) {
    return false
  }

  const name = item.name
  const component = {
    name,
    path: item.path,
    fullPath: path.resolve(item.path),
    main: findFiles(`(index|${name})\\.(t|j)sx?$`, item, true),
    style: findFiles(`(index|${name})\\.(s?css|styl|less)$`, item, true),
    documentation: findFiles(`(index|${name}).mdx?$`, item, true),
    data: findFiles(`(index|data|${name})\\.json?$`, item, true),
    tests: findFiles(`(${name}\\.)?(tests?|specs?)\\.(t|j)sx?$`, item, true),
    files: item.children
      .filter(file => file.type === 'file')
      .map(file => ({
        ...file,
        content: fs.readFileSync(file.path, 'utf-8')
      }))
  }
  if (component.main) {
    const mainContent = fs.readFileSync(component.main, 'utf-8')
    component.props = parseProps(mainContent)
  }
  if (component.style) {
    const styleContent = fs.readFileSync(component.style, 'utf-8')
    component.css = parseCSS(styleContent)
  }
  return component
}
module.exports = getComponent
