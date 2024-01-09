import { assign, createMachine } from 'xstate';

import type { Player } from '../@types/models';

const context = {
  players: [] as Array<Player>,
};

type Context = typeof context;

type Events =
  | {
      type: 'playerClicksStart';
    }
  | {
      type: 'playerJoins';
      player: Player;
    }
  | {
      type: 'playerLeaves';
      socketId: Player['socketId'];
    };

const isNewPlayer = ({ players }: { players: Array<Player> }, { player: playerFromEvent }: { player: Player }) =>
  players.find((player) => player.socketId === playerFromEvent.socketId) === undefined;

const isOnlyPlayer = ({ players }: { players: Array<Player> }) => players.length === 1;

const lobbyMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./lobby.typegen').Typegen0,
    schema: {
      context: {} as Context,
      events: {} as Events,
    },
    predictableActionArguments: true,
    id: 'lobby',
    initial: 'Empty',
    context: context,
    states: {
      Empty: {
        on: { playerJoins: { target: 'OnePlayer', actions: 'addPlayer' } },
      },
      OnePlayer: {
        on: {
          playerJoins: {
            target: 'MultiplePlayers',
            actions: 'addPlayer',
            cond: 'isNewPlayer',
          },
          playerLeaves: {
            target: 'Empty',
            actions: 'removePlayer',
          },
        },
      },
      MultiplePlayers: {
        always: {
          target: 'OnePlayer',
          cond: 'isOnlyPlayer',
        },
        on: {
          playerLeaves: { actions: 'removePlayer' },
          playerJoins: { actions: 'addPlayer' },
        },
      },
    },
  },
  {
    actions: {
      addPlayer: assign({
        players: ({ players }, { player }) => [...players, player],
      }),
      removePlayer: assign({
        players: ({ players }, { socketId }) => players.filter((p) => p.socketId !== socketId),
      }),
    },
    guards: {
      isNewPlayer,
      isOnlyPlayer,
    },
  },
);

export { context, isNewPlayer, isOnlyPlayer, lobbyMachine };
