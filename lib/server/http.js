const http = require('http')
const WebSocket = require('ws')

module.exports = function httpServer(middleware) {
  let serverMiddleware = middleware

  const server = http.createServer((req, res) => {
    if (!serverMiddleware) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(`<html><body>
        <h3>Waiting for bundle to finish</h3>
        <script>
          var socket = new WebSocket('ws://localhost:4000', 'clientSocket')

          socket.onopen = function(event) {
            socket.onmessage = event => {
              try {
                const message = JSON.parse(event.data)
                if (message.type && message.type === 'TDS_CLIENT_RELOAD') {
                  window.location.reload();
                } else {
                  console.log('[TDS]', message)
                }
              } catch (err) {
                console.log('message', event.data)
              }
            }
          }
        </script>
      </html>`)
      res.end()
    } else {
      serverMiddleware(req, res)
    }
  })

  // const tdsWS = new WebSocket.Server({ server })
  // tdsWS.on('open', () => {
  //   console.log('open socket connection')
  // })
  // tdsWS.on('message', message => {
  //   console.log('received: %s', message)
  // })
  // tdsWS.on('error', err => console.log('error:', err))
  //
  // tdsWS.on('connection', function connection(client, req) {
  //   console.log('new ws connection')
  //   client.send('[TDS] Socket ready')
  // })
  //
  // server.on('upgrade', (request, socket, head) => {
  //   console.log('updgrade server')
  //
  //   tdsWS.handleUpgrade(request, socket, head, function done(ws) {
  //     tdsWS.emit('connection', ws, request)
  //   })
  // })

  const broadcaster = data => {}
  //   if (typeof tdsWS === 'undefined' || !tdsWS) {
  //     return false
  //   }
  //   const message = typeof data !== 'string' ? JSON.stringify(data) : data
  //   try {
  //     tdsWS.clients.forEach(function each(client) {
  //       client.send(message)
  //     })
  //   } catch (err) {
  //     console.error('Could not connect to client via webSockets', err)
  //   }
  // }

  return {
    start(app, port) {
      serverMiddleware = app.callback()
      server.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
      })
    },
    broadcast: broadcaster,
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
