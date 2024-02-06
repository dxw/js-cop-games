import type { Server, Socket } from "socket.io";

import ClientboundEvents from "./clientbound";
import type Lobby from "../lobby";
import type { SocketServer } from "../socketServer";
import { Answers } from "../../client";

export default class ServerboundEvents {
  static disconnect(
    lobby: Lobby,
    socket: Socket,
    server: Server,
  ): ServerboundSocketServerEvent {
    return [
      "disconnect",
      () => {
        console.info(`disconnected: ${socket.id}`);
        lobby.removePlayer(socket.id);
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }
  static postAnswers(socket: Socket): ServerboundSocketServerEvent<"answers"> {
    return [
      "answers:post",
      (data) => {
        console.log("answers", {
          ...data,
          socketId: socket.id,
        });
        socket.emit('round:answers', data.answers);
      },
    ];
  }

  static postPlayers(
    lobby: Lobby,
    socket: Socket,
    server: Server,
  ): ServerboundSocketServerEvent<"name"> {
    return [
      "players:post",
      (data: { name: string }) => {
        const player = lobby.addPlayer(data.name, socket.id);
        socket.emit(...ClientboundEvents.setPlayer(player));
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }

  static startRound(server: SocketServer): [Event, () => void] {
    return [
      "round:start",
      () => {
        server.onRoundStarted();
      },
    ];
  }
}

type Event = "players:post" | "answers:post" | "round:start" | "disconnect";
type Payload = keyof Payloads;
type Name = string;
interface Payloads {
  answers: Answers;
  name: Name;
  socketId: string;
}

type ServerboundSocketServerEvent<T extends Payload | void = void> =
  T extends void
    ? ["disconnect", () => void]
    : [Event, (data: Payloads) => void];
