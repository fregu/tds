module.exports = ({ src, tdsUI }) => `
import React from "react"
import {Switch, Route} from '../loaders/reactRouterLoader'
import config from '../loaders/config'
// import components from '../loaders/componentsLoader'

export default function Styleguide() {
  return (
    <Switch>
      <Route path="/" exact render={()=>(
        <div>Välkommen till styleguide</div>
      )} />
      <Route path="/:1?/:2?/:3?/:4?/:5?/:6?/:7?/:8?/:9?/:10?" render={({match})=>{
        console.log(match);
        console.log(config);
        return <div>Component</div>
      }} />
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
