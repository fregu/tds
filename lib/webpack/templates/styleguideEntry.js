const pathToCamelCase = require('../../utils/pathToCamelCase')
module.exports = ({ src, allComponents = [], tdsUI }) => `
import React from "react"
import {Switch, Route} from '../loaders/reactRouterLoader'
import config from '../loaders/config'
import Component from '../../styleguide/Component'

${allComponents
  .filter(({ documentation }) => documentation)
  .map(
    ({ path, documentation }) => `
import ${pathToCamelCase(path)}Docs from '${documentation}'`
  )
  .join('')}

const allComponents = [${allComponents
  .map(({ documentation, path, ...componentData }) => {
    const Docs = documentation ? pathToCamelCase(path) : null
    const jsonString = JSON.stringify({ ...componentData, path })
    return `{
    ...${jsonString},
    render: <Component ${
      Docs ? `documentation={<div>${Docs}Docs</div>} ` : ''
    }{...${jsonString}}/>
  }`
  })
  .join(', ')}]

export default function Styleguide() {
  return (
    <Switch>
      <Route path="/styleguide" exact render={()=>(
          <div>
            <div>Välkommen till styleguide</div>
            {allComponents.map(({render}) => render)}
          </div>
      )} />
    </Switch>

  );
}
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
