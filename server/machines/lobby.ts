import { createMachine, assign } from "xstate";
import { Player } from "../@types/models";

type Question = {
  answer: Array<string>;
  number: number;
  question: string;
};

export const context = {
  players: [] as Array<Player>,
  questions: [] as Array<Question>,
  selectedQuestion: {} as Question | undefined,
};

export type Context = typeof context;

export type Events =
  | {
      type: "playerJoins";
      player: Player;
    }
  | {
      type: "playerLeaves";
      socketId: Player["socketId"];
    }
  | {
      type: "playerClicksStart";
    };

export const isNewPlayer = (
  { players }: { players: Array<Player> },
  { player: playerFromEvent }: { player: Player },
) =>
  players.find((player) => player.socketId === playerFromEvent.socketId) ===
  undefined;

export const isOnlyPlayer = ({ players }: { players: Array<Player> }) =>
  players.length === 1;

export const lobbyMachine = createMachine(
  {
    tsTypes: {} as import("./lobby.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as Events,
    },
    predictableActionArguments: true,
    id: "lobby",
    initial: "Empty",
    context,
    states: {
      Empty: {
        on: { playerJoins: { target: "OnePlayer", actions: "addPlayer" } },
      },
      OnePlayer: {
        on: {
          playerJoins: {
            target: "MultiplePlayers",
            actions: "addPlayer",
            cond: "isNewPlayer",
          },
          playerLeaves: {
            target: "Empty",
            actions: "removePlayer",
          },
        },
      },
      MultiplePlayers: {
        on: {
          playerClicksStart: "GameStart",
          playerLeaves: {
            target: "OnePlayer",
            actions: "removePlayer",
          },
          playerJoins: { actions: "addPlayer" },
        },
      },
      GameStart: {
        entry: ["setQuestion"],
        always: {
          target: "OnePlayer",
          cond: "isOnlyPlayer",
        },
        on: {
          playerLeaves: { actions: "removePlayer" },
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
        players: ({ players }, { socketId }) =>
          players.filter((p) => p.socketId !== socketId),
      }),
      setQuestion: assign({
        selectedQuestion: ({ questions }) => {
          const questionIndex = Math.floor(
            Math.random() * (questions.length - 1),
          );
          return questions[questionIndex];
        },
      }),
    },
    guards: {
      isNewPlayer,
      isOnlyPlayer,
    },
  },
);
