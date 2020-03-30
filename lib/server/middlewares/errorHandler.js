module.exports = function errorHandler({
  errorHandler,
  server: { host, port }
}) {
  return async (ctx, next) => {
    try {
      await next()
    } catch (e) {
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
