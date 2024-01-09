import { interpret } from 'xstate';

import questions from './data/questions.json';
import { context, gameMachine } from './machines/round';
import type { SocketServer } from './socketServer';

export default class Round {
  server: SocketServer;
  machine;

  constructor(server: SocketServer) {
    this.server = server;
    this.machine = interpret(gameMachine.withContext({ ...context, questions })).start();

    this.machine.onTransition((state) => {
      console.info({ state: state.value, context: state.context });
    });
  }
}
