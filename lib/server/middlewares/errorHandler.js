module.exports = function errorHandler({
  errorHandler,
  server: { host, port },
  keys: { applicationInsights: appInsightsKey } = {}
}) {
  return async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      if (appInsightsKey) {
        const appInsights = require('applicationinsights')
        appInsights
          .setup(appInsightsKey)
          .setAutoCollectConsole(true)
          .start()
        const client = appInsights.defaultClient
        if (client) {
          client.trackException({ exception: e })
        }
      }
      if (typeof errorHandler === 'function') {
        errorHandler(e, ctx, next)
      } else {
        console.log('Error:', e)
        ctx.body = `
            <p>There was an error. Please try again later.</p>
            <p>${e.name}: "${e.message}"${
          e.fileName && e.lineNumber ? `${e.fileName}:${e.lineNumber}` : ''
        }</p>
          <p>Waiting for file change</p>
          <script>var socket = new WebSocket("ws://${host}:${port}", "clientSocket");

          socket.onopen = function(event) {
            socket.onmessage = event => {
              try {
                const message = JSON.parse(event.data);
                if (message.type === 'TDS_CLIENT_RELOAD') {
                  window.location.reload(true);
                }
              } catch (err) {
                console.log("[TDS]: message", event.data);
              }
            };
          }
          </script>`
      }
    }
  }
}
