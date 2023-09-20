import http from "node:http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server } from "socket.io";

const players = new nanobuffer(50);
const getPlayers = () => Array.from(players).reverse();

const httpServer = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./client",
  });
});

const socketServer = new Server(httpServer, {});

socketServer.on("connection", (socket) => {
  console.log(`connected: ${socket.id}`);

  socket.emit("players:get", { players: getPlayers() });

  socket.on("players:post", (data) => {
    players.push(data.name);
    socketServer.emit("players:get", { players: getPlayers() });
  });

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
  });
});

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
