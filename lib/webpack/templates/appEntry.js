module.exports = ({ views = [], cssIndex, tdsUI }) => `
import React from "react"
import { Route, Switch } from "../loaders/reactRouterDomLoader"
${tdsUI ? `import Layout from 'ui/containers/Layout'` : ''}

${cssIndex ? `import "${cssIndex}"` : ''}
${views
  .map(
    view => `
    import ${view.name} from '${view.fullPath.replace(/\\/g, '\\\\')}'
    ${view.data ? `import ${view.name}Props from '${view.data.replace(/\\/g, '\\\\')}'` : ''}
`
  )
  .join('')}

  export default function App() {
    return (
      ${tdsUI ? '<Layout>' : ''}
        <Switch>
        ${views
          .sort((v1, v2) =>
            (v1.route.match(/\//g) || []).length >
            (v2.route.match(/\//g) || []).length
              ? -1
              : 1
          )
          .map(
            view =>
              `<Route path="/${(view.route || view.name)
                .toLowerCase()
                .replace(/(start|home)$/, '')}/:1?/:2?" render={({match}) => <${
                view.name
              } ${
                view.data ? `{...(${view.name}Props || {})}` : ''
              } match={match}/>} />`
          )
          .join('')}
        </Switch>
      ${tdsUI ? '</Layout>' : ''}
    );
  }
`
