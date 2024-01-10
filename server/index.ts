import http from 'http'
import handler from 'serve-handler'
import { SocketServer } from './socketServer'

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const httpServer = http.createServer(async (request, response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await handler(request as any, response as any, {
    public: './client'
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
new SocketServer(httpServer as any).create()

const port = process.env.PORT ?? 8080

httpServer.listen(port, () =>
  console.info(`Server running at http://localhost:${port}`)
)
