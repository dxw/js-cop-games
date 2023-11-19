import { Socket } from "socket.io";
import { Player } from "./@types/models";
import { SocketServer } from "./socketServer";
import { lobbyMachine, context, Context } from "./machines/lobby";
import { interpret } from "xstate";
import questions from "./data/questions.json";

export default class Game {
  server: SocketServer;
  machine;

  constructor(server: SocketServer) {
    this.server = server;
    this.machine = interpret(
      lobbyMachine.withContext({ ...context, questions }),
    ).start();
    this.machine.start();
    this.machine.onTransition((state) => {
      console.info({ state: state.value, context: state.context });

      switch (state.value) {
        case "GameStart":
          this.emitQuestionSet(state.context.selectedQuestion);
          break;
        default:
          break;
      }
    });
  }

  addPlayer = (name: Player["name"], socketId: Socket["id"]) => {
    const player = { name, socketId };
    this.machine.send({ type: "playerJoins", player });
    return this.findPlayer(player);
  };

  findPlayer = (player: Player): Player => {
    const desiredPlayer = this.machine
      .getSnapshot()
      .context.players.find((p) => p.socketId === player.socketId);

    if (!desiredPlayer) {
      throw new Error("Player not found in context");
    }

    return desiredPlayer;
  };

  playerNames = (): Array<Player["name"]> => {
    return this.machine
      .getSnapshot()
      .context.players.map((player) => player.name)
      .reverse();
  };

  removePlayer = (socketId: Socket["id"]): void => {
    this.machine.send({ type: "playerLeaves", socketId });
  };

  start = (): void => {
    this.machine.send({ type: "playerClicksStart" });
  };

  emitQuestionSet = (question: Context["selectedQuestion"]): void => {
    if (!question) throw new Error("No question selected");
    this.server.onQuestionSet(question);
  };
}
