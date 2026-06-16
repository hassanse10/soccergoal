import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// football-data.org doesn't send CORS headers and requires a secret API
// key, so the browser talks to us and we forward to the real API.
app.use(
  '/api/fd',
  createProxyMiddleware({
    target: 'https://api.football-data.org/v4',
    changeOrigin: true,
    pathRewrite: { '^/api/fd': '' },
    headers: { 'X-Auth-Token': process.env.FD_API_KEY },
  })
)

app.use(
  '/api/news',
  createProxyMiddleware({
    target: 'https://newsapi.org/v2',
    changeOrigin: true,
    pathRewrite: { '^/api/news': '' },
    headers: { Authorization: `Bearer ${process.env.NEWS_API_KEY}` },
  })
)

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on port ${port}`))
