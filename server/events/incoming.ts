import { Server, Socket } from "socket.io";
import Game from "../game";
import OutboundEvents from "./outbound";

export default class IncomingEvents {
  static disconnect(game: Game, socket: Socket, server: Server): [string, any] {
    return [
      "disconnect",
      () => {
        console.log(`disconnected: ${socket.id}`);
        game.removePlayer(socket.id);
        server.emit(...OutboundEvents.getPlayers(game));
      },
    ];
  }

  static postPlayers(
    game: Game,
    socket: Socket,
    server: Server,
  ): [string, any] {
    return [
      "players:post",
      (data: any) => {
        const player = game.addPlayer(data.name, socket.id);
        socket.emit(...OutboundEvents.setPlayer(player));
        server.emit(...OutboundEvents.getPlayers(game));

        if (game.players.length === 2) {
          game.start();
        }
      },
    ];
  }
}
