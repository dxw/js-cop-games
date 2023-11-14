import { createMachine, createActor, assign } from "xstate";
import { Player } from "../@types/models";

const lobbyMachine = createMachine({
  id: "lobby",
  initial: "Empty",
  context: {
    players: [] as Array<Player>,
  },
  states: {
    Empty: {
      on: {
        playerJoins: {
          target: "HasPlayers",
          actions: assign({
            players: ({ event }) => [event.player],
          }),
        },
      },
    },
    HasPlayers: {
      on: {
        playerJoins: [
          {
            actions: assign({
              players: ({ event, context }) => [
                ...context.players,
                event.player,
              ],
            }),
          },
          {
            guard: ({ context }) => context.players.length > 1,
            target: "ReadyToPlay",
          },
        ],
      },
    },
    ReadyToPlay: {
      on: {
        playerClicksStart: "GameStart",
      },
    },
    GameStart: {},
  },
});

// Creates an actor that you can send events to; not started yet!
const lobbyActor = createActor(lobbyMachine);

lobbyActor.subscribe((snapshot) => {
  console.log("Value:", snapshot.value);
  console.log("Context:", snapshot.context.players);
});
// Start the actor!
lobbyActor.start(); // logs 'Inactive'

lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id", name: "a name" },
});

lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-2", name: "a name-2" },
});
