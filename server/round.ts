import { interpret } from "xstate";
import { SocketServer } from "./socketServer";
import { gameMachine, context } from "./machines/round";
import questions from "./data/questions.json";

export default class Round {
  server: SocketServer;
  machine;

  constructor(server: SocketServer) {
    this.server = server;
    this.machine = interpret(
      gameMachine.withContext({ ...context, questions }),
    ).start();

    this.machine.onTransition((state) => {
      console.info({ state: state.value, context: state.context });
    });
  }
}
