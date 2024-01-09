import type { Socket } from 'socket.io';
import type { InterpreterFrom } from 'xstate';
import { interpret } from 'xstate';

import type { Player } from './@types/models';
import { context, lobbyMachine } from './machines/lobby';
import type { SocketServer } from './socketServer';

export default class Lobby {
  machine: InterpreterFrom<typeof lobbyMachine>;
  server: SocketServer;

  constructor(server: SocketServer) {
    this.server = server;
    this.machine = interpret(lobbyMachine.withContext({ ...context })).start();
    this.machine.start();
    this.machine.onTransition((state) => {
      console.info({ context: state.context, state: state.value });

      switch (state.value) {
        case 'MultiplePlayers':
          this.emitShowStartButton();
          break;
        default:
          break;
      }
    });
  }

  addPlayer = (name: Player['name'], socketId: Socket['id']) => {
    const player = { name, socketId };
    this.machine.send({ player, type: 'playerJoins' });
    return this.findPlayer(player);
  };

  emitShowStartButton = (): void => {
    this.server.onShowStartButton();
  };

  findPlayer = (player: Player): Player => {
    const desiredPlayer = this.machine.getSnapshot().context.players.find((p) => p.socketId === player.socketId);

    if (!desiredPlayer) {
      throw new Error('Player not found in context');
    }

    return desiredPlayer;
  };

  playerNames = (): Array<Player['name']> => {
    return this.machine
      .getSnapshot()
      .context.players.map((player) => player.name)
      .reverse();
  };

  removePlayer = (socketId: Socket['id']): void => {
    this.machine.send({ socketId, type: 'playerLeaves' });
  };
}
