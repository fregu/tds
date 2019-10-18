module.exports = async function timeLogger(message, callback) {
  const startTime = new Date()
  const response = await callback()
  console.log(message, new Date() - startTime + 'ms')
  return response
}
