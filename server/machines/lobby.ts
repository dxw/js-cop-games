import { assign, createMachine } from 'xstate';

import type { Player } from '../@types/models';

const context = {
  players: [] as Array<Player>,
};

type Context = typeof context;

type Events =
  | {
      player: Player;
      type: 'playerJoins';
    }
  | {
      socketId: Player['socketId'];
      type: 'playerLeaves';
    }
  | {
      type: 'playerClicksStart';
    };

const isNewPlayer = ({ players }: { players: Array<Player> }, { player: playerFromEvent }: { player: Player }) =>
  players.find((player) => player.socketId === playerFromEvent.socketId) === undefined;

const isOnlyPlayer = ({ players }: { players: Array<Player> }) => players.length === 1;

const lobbyMachine = createMachine(
  {
    context: context,
    id: 'lobby',
    initial: 'Empty',
    predictableActionArguments: true,
    schema: {
      context: {} as Context,
      events: {} as Events,
    },
    states: {
      Empty: {
        on: { playerJoins: { actions: 'addPlayer', target: 'OnePlayer' } },
      },
      MultiplePlayers: {
        always: {
          cond: 'isOnlyPlayer',
          target: 'OnePlayer',
        },
        on: {
          playerJoins: { actions: 'addPlayer' },
          playerLeaves: { actions: 'removePlayer' },
        },
      },
      OnePlayer: {
        on: {
          playerJoins: {
            actions: 'addPlayer',
            cond: 'isNewPlayer',
            target: 'MultiplePlayers',
          },
          playerLeaves: {
            actions: 'removePlayer',
            target: 'Empty',
          },
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./lobby.typegen').Typegen0,
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
