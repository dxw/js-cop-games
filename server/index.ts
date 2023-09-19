import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server, Socket } from "socket.io";
import { Player } from "./@types/models";

// fixed length Array<Player>
let players = new nanobuffer(50);

const addPlayer = (name: Player["name"], socketId: Socket["id"]): Player => {
  const player: Player = { name, socketId };
  players.push(player);

  return player;
};

const getPlayerNames = (): Array<Player["name"]> => {
  const playersArray = Array.from(players as Iterable<Player>).reverse();

  return playersArray.map((player) => player.name);
};

const removePlayer = (socketId: Socket["id"]): void => {
  const playersArray = Array.from(players as Iterable<Player>);

  const playerToRemoveIndex = playersArray.findIndex(
    (player) => (player.socketId = socketId),
  );

  players.clear();

  playersArray.forEach((player, playerIndex) => {
    if (playerIndex !== playerToRemoveIndex) {
      players.push(player);
    }
  });
};

const httpServer = http.createServer((request, response) => {
  return handler(request as any, response as any, {
    public: "./client",
  });
});

const socketServer = new Server(httpServer as any, {});

socketServer.on("connection", (socket) => {
  console.log(`connected: ${socket.id}`);

  socket.emit("players:get", { players: getPlayerNames() });

  socket.on("players:post", (data) => {
    const player = addPlayer(data.name, socket.id);
    socket.emit("player:set", { player });
    socketServer.emit("players:get", { players: getPlayerNames() });
  });

  socket.on("disconnect", () => {
    console.log(`disconnected: ${socket.id}`);
    removePlayer(socket.id);
    socketServer.emit("players:get", { players: getPlayerNames() });
  });
});

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
