import { createMachine, assign } from "xstate";
import { Player } from "../@types/models";

export const context = {
  players: [] as Array<Player>,
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
    /** @xstate-layout N4IgpgJg5mDOIC5QBsD2AjdBPAdAUQFsAHAFywGIjkBDLMAJwClUBLAO1gG0AGAXUVBFUsFiRao2AkAA9EARgAsAdhwAmJQGYFGgJwBWZUp0AOVQBoQWRKpM4lANg3cNxhXqVzuxuQF8fFtExcAHk2MAAFGjp6SiiGZnYuPikhETEJKVkEbR0cbQUdbjl7Ezk9VXt7CysEJzk1R2dXd09vPwCMbBxQiLiYqloGABkwagA3OB5+JBBU0XFJGazFFXUtXQMlI1Nq62ccPW4lU259IrlVBXaQQK6AWQBXZDEqXsH6WFj3gGFkFgBjADWsAAyiRqPQSFMUsJ5hkloh7MY9Dh7B5jMYlNpyuo5LsELicMYNCTlEVuPYKjprrdcI9nixXpF3p8BtERuNJskZnN0otQFklNxuGpMQ4lHpkaYNFVLPIHAdjhczjKNBcaZ06U8Xsg3tFWX0EhxoTzYXzMoghfYcDo0Qp7HJdLbkeY5QhvDgNKobHI5DpbY49HoNUEcPSdXqGJ8TYIzQsLQg9BoUUH7YU-a5iUp8aogzaFGtVM5lC0-P4QGxUBA4FJaTC0vGEQgALSymqtkNdQikGqxhvwgWIAv4tUaA72AuS+zOQpKVSdkJhZnRetw-kyRBOFEeU4KYlHSpuEfFHAUgu5hxaBRuK7l2lh7WM3XLqOr81NkoKHDFRQOjQePRHFdGovWtCdJSDCUg28akyyAA */
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
        always: {
          target: "OnePlayer",
          cond: "isOnlyPlayer",
        },
        on: {
          playerLeaves: { actions: "removePlayer" },
          playerJoins: { actions: "addPlayer" },
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
    },
    guards: {
      isNewPlayer,
      isOnlyPlayer,
    },
  },
);
