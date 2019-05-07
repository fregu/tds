const path = require("path");
const styleguidist = require("react-styleguidist");
const styleguideConfig = require("./styleguide.config.js");

module.exports = function createStyleguide(config) {
  const {
    tdsUI,
    paths: { root, ui: tdsUiPath }
  } = config;

  if (tdsUI) {
    const uiPath = path.resolve(root, tdsUiPath);

    styleguideConfig.sections = styleguideConfig.sections.map(section => ({
      ...section,
      components: [section.components.replace(root, uiPath), section.components]
    }));
    console.log(styleguideConfig.sections);
  }
  const styleguide = styleguidist(styleguideConfig);

  return {
    serve() {
      styleguide.server((err, config) => {
        if (err) {
          console.log(err);
        } else {
          const url = `http://${config.serverHost}:${config.serverPort}`;
          console.log(`Listening at ${url}`);
        }
      });
    },
    build() {
      styleguide.build((err, config, stats) => {
        if (err) {
          console.log(err);
        } else {
          console.log(stats, stats.toJson());
          console.log("Style guide published to", config.styleguideDir);
        }
      });
    }
  };
};

// // @flow
// import React, { type Node, Component } from 'react'
// import { Connect } from '../store'
// import { Route, Switch } from 'react-router-dom'
//
// type StyleRouteProps = {
//   render?: Function,
//   component?: Node,
//   path: string
// }
// type Props = {
//   components: Array<{
//     path: string,
//     component: Node,
//     props: any
//   }>
// }
// class StyleRoute extends Component<StyleRouteProps> {
//   render() {
//     const { render, component: RenderComponent, path, ...props } = this.props
//     return (
//       <Route
//         path={path}
//         render={() => (render ? render(props) : <RenderComponent {...props} />)}
//       />
//     )
//   }
// }
//
// export default function Styleguide({ components = [] }: Props) {
//   return (
//     <div>
//       <h2>Styleguide</h2>
//       <Connect mapStateToProps={({ counter = 0 }) => ({ counter })}>
//         {({ counter }) => (
//           <Switch>
//             {components.map(route => (
//               <StyleRoute
//                 key={route.path}
//                 path={
//                   route.path === 'Home' || route.path === 'Start'
//                     ? '/'
//                     : '/' + route.path
//                 }
//                 component={route.component}
//                 {...route.props}
//               />
//             ))}
//             <Route render={() => 'Styleguide'} />
//           </Switch>
//         )}
//       </Connect>
//     </div>
//   )
// }
