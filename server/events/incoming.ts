import { Server, Socket } from "socket.io";
import Lobby from "../lobby";
import OutboundEvents from "./outbound";
import { SocketServer } from "../socketServer";

export default class IncomingEvents {
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
        server.emit(...OutboundEvents.getPlayers(lobby));
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
        socket.emit(...OutboundEvents.setPlayer(player));
        server.emit(...OutboundEvents.getPlayers(lobby));
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
