import { Server, Socket } from "socket.io";
import Lobby from "../lobby";
import ClientboundEvents from "./clientbound";
import { SocketServer } from "../socketServer";

export default class ServerboundEvents {
  static disconnect(
    lobby: Lobby,
    socket: Socket,
    server: Server,
  ): [string, () => void] {
    return [
      "disconnect",
      () => {
        console.info(`disconnected: ${socket.id}`);
        lobby.removePlayer(socket.id);
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }

  static postPlayers(
    lobby: Lobby,
    socket: Socket,
    server: Server,
  ): [string, (data: { name: string }) => void] {
    return [
      "players:post",
      (data: { name: string }) => {
        const player = lobby.addPlayer(data.name, socket.id);
        socket.emit(...ClientboundEvents.setPlayer(player));
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }

  static startRound(server: SocketServer): [string, () => void] {
    return [
      "round:start",
      () => {
        server.onRoundStarted();
      },
    ];
  }
}
