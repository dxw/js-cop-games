import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Lobby from "./lobby";
import { Question } from "./@types/models";
import ClientboundEvents from "./events/clientbound";
import ServerboundEvents from "./events/severbound";
import Round from "./round";

export class SocketServer {
  lobby: Lobby;
  round?: Round;
  server: Server;

  constructor(httpServer: HttpServer) {
    this.lobby = new Lobby(this);
    this.server = new Server(httpServer, {});

    this.onCreated();
  }

  onCreated() {
    this.server.on("connection", (socket) => {
      console.info(`connected: ${socket.id}`);

      socket.emit(...ClientboundEvents.getPlayers(this.lobby));
      socket.on(
        ...ServerboundEvents.postPlayers(this.lobby, socket, this.server),
      );
      socket.on(
        ...ServerboundEvents.disconnect(this.lobby, socket, this.server),
      );
      socket.on(...ServerboundEvents.startRound(this));
    });
  }

  onQuestionSet(question: Question) {
    this.server.emit(...ClientboundEvents.getQuestion(question));
  }

  onShowStartButton() {
    this.server.emit(ClientboundEvents.showStartButton());
  }

  onRoundStarted() {
    this.round = new Round(this);
  }
}
