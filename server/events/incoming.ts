import { Server, Socket } from "socket.io";
import Game from "../game";
import OutboundEvents from "./outbound";

export default class IncomingEvents {
  static disconnect(
    game: Game,
    socket: Socket,
    server: Server,
  ): [string, () => void] {
    return [
      "disconnect",
      () => {
        console.info(`disconnected: ${socket.id}`);
        game.removePlayer(socket.id);
        server.emit(...OutboundEvents.getPlayers(game));
      },
    ];
  }

  static postPlayers(
    game: Game,
    socket: Socket,
    server: Server,
  ): [string, (data: { name: string }) => void] {
    return [
      "players:post",
      (data: { name: string }) => {
        const player = game.addPlayer(data.name, socket.id);
        socket.emit(...OutboundEvents.setPlayer(player));
        server.emit(...OutboundEvents.getPlayers(game));
      },
    ];
  }
}
