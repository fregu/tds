const waitForIt = ctx =>
  new Promise((resolve, reject) => {
    let notReadyInterval
    notReadyInterval = setInterval(() => {
      console.log('interval wait', ctx.waitForIt)
      if (!ctx.waitForIt) {
        clearInterval(notReadyInterval)
        resolve(true)
      }
    }, 500)
  })

module.exports = async (ctx, next) => {
  if (ctx.bundleNotReady) {
    await waitForIt(ctx)
  }
  return next()
}
