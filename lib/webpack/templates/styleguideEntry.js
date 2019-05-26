module.exports = ({ src, tdsUI }) => `
import React from "react"
import components from '../loaders/componentsLoader'

export default function Styleguide() {
  return (
    <div>Välkommen till styleguide</div>
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
    {/*
      navigation, app vs. ui
      filter components with props or documentation
      import all mdx files
      route each component
      map each category
        list each component
          <ComponentWrapper path={path} props={props} files={files} dependencies={dependencies} css={css}>
            <ReadMe component={ComponentDocumentation} />
          </ComponentWrapper>
    */}
  );
}
`
