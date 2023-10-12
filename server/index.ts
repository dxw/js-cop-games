import http from "http";
import handler from "serve-handler";
import { SocketServer } from "./socketServer";

const httpServer = http.createServer((request, response) => {
  return handler(request as any, response as any, {
    public: "./client",
  });
});

new SocketServer(httpServer);

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
