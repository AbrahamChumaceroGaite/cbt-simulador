const { createServer } = require('http')
const { parse }        = require('url')
const next             = require('next')
const httpProxy        = require('http-proxy')

const dev  = process.env.NODE_ENV !== 'production'
const app  = next({ dev, dir: __dirname })
const handle = app.getRequestHandler()
const api  = process.env.API_URL ?? 'http://localhost:4002'

const proxy = httpProxy.createProxyServer({ target: api, changeOrigin: true })

proxy.on('error', (err, req, res) => {
  console.error('[ws-proxy] proxy error:', err.message)
  if (res && !res.headersSent) res.end()
})

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)))

  server.on('upgrade', (req, socket, head) => {
    console.log(`[ws-proxy] upgrade → ${api}${req.url}`)
    socket.on('error', err => console.error('[ws-proxy] socket error:', err.message))
    proxy.ws(req, socket, head, {}, (err) => {
      if (err) console.error('[ws-proxy] callback error:', err.message)
    })
  })

  const port = process.env.PORT ?? 3002
  server.listen(port, () => {
    console.log(`Simulador web ready on http://localhost:${port}`)
  })
})
