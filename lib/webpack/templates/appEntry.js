module.exports = ({ views, cssIndex, tdsUI }) => `
import React from "react"
import { Route, Switch } from "../loaders/reactRouterDomLoader"
${tdsUI ? `import Layout from 'ui/containers/Layout'` : ""}

${cssIndex ? `import "${cssIndex}"` : ""}
${views
  .map(
    view => `
    import ${view.route.replace(/\//, "")} from '${process.cwd() +
      "/" +
      view.path}'
    ${
      view.data
        ? `import ${view.route.replace(/\//, "")}Props from '${process.cwd() +
            "/" +
            view.data}'`
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
                .replace(
                  /(start|home)$/,
                  ""
                )}/:1?/:2?" render={({match}) => <${view.route.replace(
                /\//,
                ""
              )} ${
                view.data
                  ? `{...(${view.route.replace(/\//, "")}Props || {})}`
                  : ""
              } match={match}/>} />`
          )
          .join("")}
        </Switch>
      ${tdsUI ? "</Layout>" : ""}
    );
  }
`;
