module.exports = ({
  views,
  cssIndex,
  node_modules: { "@jayway/tds-ui": tdsUI } = {}
}) => `
import React from "react"
import { Route, Switch } from "../loaders/reactRouterDomLoader"
${tdsUI ? `import Layout from 'ui/containers/Layout'` : ""}

${cssIndex ? `import "${cssIndex}"` : ""}
${views
  .map(
    view => `
    import ${view.name} from '${process.cwd() + "/" + view.path}'
    ${
      view.data
        ? `import ${view.name}Props from '${process.cwd() + "/" + view.data}'`
        : ""
    }
`
  )
  .join("")}

  export default function App() {
    return (
      ${tdsUI ? "<Layout>" : ""}
        <Switch>
        ${views
          .map(
            view =>
              `<Route exact path="/${(view.route || view.name)
                .toLowerCase()
                .replace(/(start|home)$/, "")}" render={() => <${view.name} ${
                view.data ? `{...(${view.name}Props || {})}` : ""
              } />} />`
          )
          .join("")}
        </Switch>
      ${tdsUI ? "</Layout>" : ""}
    );
  }
`;
