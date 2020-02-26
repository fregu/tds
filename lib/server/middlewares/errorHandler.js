module.exports = function errorHandler({
  errorHandler,
  server: { host, port },
  keys: { applicationInsights: appInsightsKey, bugsnag: bugsnagKey } = {}
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
        console.error('Error:', e)
        ctx.body = `
            <p>There was an error. Please try again later.</p>
            <p>${e.name}: "${e.message}"${
          e.fileName && e.lineNumber ? `${e.fileName}:${e.lineNumber}` : ''
        }</p>`
      }
    }
  }
}
