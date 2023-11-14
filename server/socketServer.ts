import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Game from "./game";
import { Question } from "./@types/models";
import OutboundEvents from "./events/outbound";
import IncomingEvents from "./events/incoming";

export class SocketServer {
  game: Game;
  server: Server;

  constructor(httpServer: HttpServer) {
    this.game = new Game(this);
    this.server = new Server(httpServer, {});

    this.onCreated();
  }

  onCreated() {
    this.server.on("connection", (socket) => {
      console.log(`connected: ${socket.id}`);

      socket.emit(...OutboundEvents.getPlayers(this.game));
      socket.on(...IncomingEvents.postPlayers(this.game, socket, this.server));
      socket.on(...IncomingEvents.disconnect(this.game, socket, this.server));
    });
  }

  onQuestionSet(question: Question) {
    this.server.emit(...OutboundEvents.getQuestion(question));
  }
}
