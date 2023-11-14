import { createMachine, createActor, assign } from "xstate";
import { Player } from "../@types/models";

const lobbyMachine = createMachine(
  {
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
            actions: [{ type: "addPlayer" }],
          },
        },
      },
      HasPlayers: {
        on: {
          playerJoins: [
            {
              guard: ({ context }) => context.players.length < 2,
              actions: [{ type: "addPlayer" }],
            },
            {
              guard: ({ context }) => context.players.length > 1,
              target: "ReadyToPlay",
              actions: [{ type: "addPlayer" }],
            },
          ],
        },
      },
      ReadyToPlay: {
        on: {
          playerClicksStart: "GameStart",
          playerJoins: [
            {
              actions: [{ type: "addPlayer" }],
            },
          ],
        },
      },
      GameStart: {},
    },
  },
  {
    actions: {
      addPlayer: ({ event, context }) => {
        context.players.push(event.player);
      },
    },
  },
);

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

lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-3", name: "a name-3" },
});

lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-4", name: "a name-4" },
});
