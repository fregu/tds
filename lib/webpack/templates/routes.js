module.exports = routes => `
${routes
  .map(
    route => `
    import ${route.name} from '${process.cwd() + "/" + route.path}'
    ${
      route.data
        ? `import ${route.name}Props from '${process.cwd() + "/" + route.data}'`
        : ""
    }
`
  )
  .join("")}
export default [${routes.map((route, index) => {
  const routePath = (route.route || route.name)
    .toLowerCase()
    .replace(/(start|home)$/, "");
  return `{path:'${routePath}', component:${route.name} ${
    route.data ? `, props: ${route.name + "Props"}` : ""
  }}`;
})}]
`;
