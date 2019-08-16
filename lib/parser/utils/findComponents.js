const getComponent = require('./getComponent')

const findComponents = (items, parent, components = []) => {
  // if folder {findComponents(path+folder)}
  if (!items.length) {
    return components
  }
  return items.reduce((components, child) => {
    const baseName = child.name.replace(child.extension, '')
    if (child.type === 'file' && !items.find(comp => comp.name === baseName)) {
      return [
        ...components,
        getComponent({
          ...parent,
          name: baseName,
          path: `${parent.path}/${baseName}`,
          fullPath: `${parent.fullPath}/${baseName}`,
          children: items.filter(
            c => c.type === 'file' && c.name.match(new RegExp(`^${baseName}.`))
          )
        })
      ]
    } else if (child.type === 'directory' && child.children) {
      const component = getComponent(child)

      return [
        ...components,
        ...(component ? [component] : []),
        ...findComponents(
          child.children.filter(c => !component || c.type === 'directory'),
          child
        )
      ]
    }
    return components
  }, components)
}

module.exports = findComponents
