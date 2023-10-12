import http from "http";
import handler from "serve-handler";
import { Server } from "socket.io";
import { Game } from "./game";

const game = new Game();

const httpServer = http.createServer((request, response) => {
  return handler(request as any, response as any, {
    public: "./client",
  });
});

const socketServer = new Server(httpServer as any, {});

socketServer.on("connection", (socket) => {
  console.log(`connected: ${socket.id}`);

  socket.emit("players:get", { players: game.getPlayerNames() });

  socket.on("players:post", (data) => {
    const player = game.addPlayer(data.name, socket.id);
    socket.emit("player:set", { player });
    socketServer.emit("players:get", { players: game.getPlayerNames() });

    if (game.players.length === 2) {
      startGame();
    }
  });

  socket.on("disconnect", () => {
    console.log(`disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
    socketServer.emit("players:get", { players: game.getPlayerNames() });
  });
});

const startGame = (): void => {
  game.start();
  socketServer.emit("question:get", game.currentQuestion);
};

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
