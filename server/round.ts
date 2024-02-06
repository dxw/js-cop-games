import type { InterpreterFrom } from 'xstate';
import { interpret } from 'xstate';

import type { Question } from './@types/models';
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
      console.info({
        [`round ${Date.now()}`]: {
          context: state.context,
          state: state.value,
        },
      });
      switch (state.value) {
        case 'GameStart':
          this.server.onQuestionSet(this.machine.getSnapshot().context.selectedQuestion as Question);
          break;
        default:
          break;
      }
    });
  }
}
