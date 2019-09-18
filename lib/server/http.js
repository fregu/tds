const Koa = require('koa')
const http = require('http')
const WebSocket = require('ws')

module.exports = function httpServer(middleware) {
  let serverMiddleware = middleware
  let broadcaster = () => {}

  const server = http.createServer((req, res) => {
    if (!serverMiddleware) {
      res.body = 'Waiting for bundle to finish'
    } else {
      serverMiddleware(req, res)
    }
  })

  // const ws = new WebSocket.Server({ server })
  // ws.on('open', () => {
  //   console.log('open socket connection')
  //   broadcaster = message => {
  //     try {
  //       ws.send(typeof message !== 'string' ? JSON.stringify(message) : message)
  //     } catch (err) {
  //       console.error('Could not connect to client via webSockets', err)
  //     }
  //   }
  // })
  // ws.on('message', message => {
  //   console.log('received: %s', message)
  // })
  //
  // ws.on('connection', function connection(wsClient, req) {
  //   console.log('new ws connection')
  //   wsClient.send('[TDS] Socket ready')
  // })

  return {
    start(app, port) {
      serverMiddleware = app.callback()
      server.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
      })
    },
    broadcast(message) {
      broadcaster(message)
    },
    update(app) {
      broadcaster({ type: 'TDS_CLIENT_RELOAD' })
      serverMiddleware = app.callback()
    },
    listen(port) {
      server.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
      })
    }
  }
}
