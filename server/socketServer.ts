import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Lobby from "./lobby";
import { Question } from "./@types/models";
import OutboundEvents from "./events/outbound";
import InboundEvents from "./events/inbound";
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

      socket.emit(...OutboundEvents.getPlayers(this.lobby));
      socket.on(...InboundEvents.postPlayers(this.lobby, socket, this.server));
      socket.on(...InboundEvents.disconnect(this.lobby, socket, this.server));
      socket.on(...InboundEvents.startRound(this));
    });
  }

  onQuestionSet(question: Question) {
    this.server.emit(...OutboundEvents.getQuestion(question));
  }

  onShowStartButton() {
    this.server.emit(OutboundEvents.showStartButton());
  }

  onRoundStarted() {
    this.round = new Round(this);
  }
}
