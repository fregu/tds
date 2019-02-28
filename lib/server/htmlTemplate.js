export default function htmlTemplate(
  html,
  {
    reactDom = "<div />",
    reduxState,
    apolloState,
    helmetData,
    graphql = {},
    socket = {}
  }
) {
  const headString = `
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
    ${helmetData.link.toString()}
    ${helmetData.style.toString()}
  `;
  const stateScript = `
    <script>
      window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
      window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
      ${
        graphql.endpoint
          ? `window.__GRAPHQL_ENDPOINT__ = '${graphql.endpoint}'`
          : ""
      }
      ${graphql.token ? `window.__GRAPHQL_TOKEN__ = '${graphql.token}'` : ""}
      ${
        socket.endpoint
          ? `window.__WEBSOCKET_ENDPOINT__ = '${socket.endpoint}'`
          : ""
      }
    </script>
  `;

  return html
    .replace(
      '<div id="root"></div>',
      `${helmetData.noscript.toString()}<div id="root">${reactDom}</div>${stateScript}`
    )
    .replace("</head>", `${headString}</head>`)
    .replace("<body", `<body ${helmetData.bodyAttributes.toString()}`)
    .replace("<html", `<html ${helmetData.htmlAttributes.toString()}`)
    .replace("</body>", `${helmetData.script.toString()}</body>`);
}
