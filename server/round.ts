import type { InterpreterFrom } from 'xstate';
import { interpret } from 'xstate';

import questions from './data/questions.json';
import { context, gameMachine } from './machines/round';
import type { SocketServer } from './socketServer';

export default class Round {
  machine: InterpreterFrom<typeof gameMachine>;
  server: SocketServer;

  constructor(server: SocketServer) {
    this.server = server;
    this.machine = interpret(gameMachine.withContext({ ...context, questions })).start();

    this.machine.onTransition((state) => {
      console.info({ context: state.context, state: state.value });
    });
  }
}
