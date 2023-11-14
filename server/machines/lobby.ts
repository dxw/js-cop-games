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

export const lobbyMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QBsD2AjdBPAdAUQFsAHAFywGIjkBDLMAJwClUBLAO1gG0AGAXUVBFUsFiRao2AkAA9EARgAsANhwAOBQGYA7AFYNSjYoBMSrQBoQWeVpVajcjZo2q53He40BfTxbSZcAPJsYAAKNHT0lOEMzOxcfFJCImISUrIImqo4JhrcDqpG6lpyFlYIcjoqmgqqqloaAJxydbrevhjYOEGh0ZFUtAwAMmDUAG5wPPxIIEmi4pLT6Yoq6tp6BsampYguOBpGRk21utxaqg1ePiB+nQCyAK7IYlQ9A-SwUW8AwsgsAMYAa1gAGUSNR6CRJolhHNUosdg5sgoGg0lNxTlozm5tuVFDglA1uA16nIGnpdEY2tcOrgHk8WC8wm8Pv0IsMxhMEtNZikFqB0sijDhUY4GvZ0R4FDjXCo0RctDUlAojJUyd4rmxUBA4FIbmVBDDeWlEABaJQ4k06YUohouByuJwGKl6-DEMjQ5LzY0ZIzSolqHTnRzKQO5YrOmldYJMiIe2F8mSIXJWwN2ZxGBRaMky6VyIUaQMXBQh1RhhQR-w4OnPZCvCLwbmGr3whBKho4ORKYxGYqGQklSzyPGqQvBpSh07lq4ugDi1AIYFB4JIcaNLZRWSzSgKOmahh0Ch0uYUAaDxfHpcn6s8QA */
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
        },
      },
      GameStart: {
        entry: ["setQuestion"],
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
    },
  },
);
