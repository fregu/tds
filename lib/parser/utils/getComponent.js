const fs = require('fs-extra')
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
    documentation: findFiles(`(readme|index|${name})\\.mdx?$`, item, true),
    data: findFiles(`(index|data|${name})\\.json?$`, item, true),
    tests: findFiles(`(${name}\\.)?(tests?|specs?)\\.(t|j)sx?$`, item, true),
    dependencies: {},
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

    component.dependencies = (
      mainContent.match(/import (.*) from ["'](.*)["']/g) || []
    ).reduce((dependencies, dependency) => {
      const stringMatch = dependency.match(/import (.*) from ["'](.*)["']/)
      return { ...dependencies, [stringMatch[1]]: stringMatch[2] }
    }, component.dependencies)
  }
  if (component.style) {
    const styleFiles = component.files.filter(file =>
      file.name.match(/(s?css|styl|less)$/)
    )

    component.css = {
      files: styleFiles.map(({ name, content }) => ({
        name,
        ...parseCSS(content)
      }))
    }
  }
  return {
    ...component,
    files: component.files.map(({ content, ...file }) => file)
  }
}
module.exports = getComponent
