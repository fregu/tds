export default function htmlTemplate(
  html,
  {
    reactDom = '<div />',
    reduxState = {},
    apolloState = {},
    helmetData,
    graphql = {},
    socket = {},
    globals = {}
  }
) {
  const headString = `
    ${helmetData && helmetData.title.toString()}
    ${helmetData && helmetData.meta.toString()}
    ${helmetData && helmetData.link.toString()}
    ${helmetData && helmetData.style.toString()}
  `
  const stateScript = `
    <script>
      window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
      window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
      ${
        graphql.endpoint
          ? `window.__GRAPHQL_ENDPOINT__ = '${graphql.endpoint}'`
          : ''
      }
      ${graphql.token ? `window.__GRAPHQL_TOKEN__ = '${graphql.token}'` : ''}

      ${
        socket.endpoint
          ? `window.__WEBSOCKET_ENDPOINT__ = '${socket.endpoint}'`
          : ''
      }
      ${Object.keys(globals).map(key => `window.${key} = ${globals[key]};`)
        .join(`
        `)}
    </script>
  `

  return html
    .replace(
      '<div id="root"></div>',
      `${helmetData &&
        helmetData.noscript.toString()}<div id="root">${reactDom}</div>${stateScript}`
    )
    .replace('</head>', `${headString}</head>`)
    .replace('</head>', `${helmetData && helmetData.script.toString()}</head>`)
    .replace(
      '<body',
      `<body ${helmetData && helmetData.bodyAttributes.toString()}`
    )
    .replace(
      '<html',
      `<html ${helmetData && helmetData.htmlAttributes.toString()}`
    )
}
