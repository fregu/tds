const pathToPascalCase = require('../../utils/pathToPascalCase')

module.exports = ({ src, allComponents = [], tdsUI }) => `
import React from "react"
import Styleguide from "../../styleguide/Styleguide"

${allComponents
  .filter(({ documentation }) => documentation)
  .map(
    ({ path, documentation }) => `
import ${pathToPascalCase(path)}Docs from '${documentation}'`
  )
  .join('')}

const allComponents = [${allComponents
  .map(({ documentation, path, ...componentData }) => {
    const Docs = documentation ? `${pathToPascalCase(path)}Docs` : null
    const jsonString = JSON.stringify({ ...componentData, path })
    return documentation
      ? `{
      ...${jsonString},
      documentation: <${Docs} />
  }`
      : jsonString
  })
  .join(', ')}]

export default () => <Styleguide components={allComponents} />
`
/*
  navigation, app vs. ui
  filter components with props or documentation
  import all mdx files
  route each component
  map each category
    list each component
      <ComponentWrapper path={path} props={props} files={files} dependencies={dependencies} css={css}>
        <ReadMe component={ComponentDocumentation} />
      </ComponentWrapper>
*/
/*
<Switch>
  {documentation ? (
    <Fragment>
      {documentation.map(({path, component: Component}) => <Route path={'/documentation' + doc.path} component={Component} />)}
      <Route path='/documentation' component={Documentation} />
    </Fragment>
  ) : null}
  <Route path='/patterns' component={Patterns} />
  <Route path='/components' component={Components} />
  <Route path='/containers' component={Containers} />
  <Route path='/helpers' component={Helpers} />
  <Route path='/views' component={Views} />
</Switch>
*/
