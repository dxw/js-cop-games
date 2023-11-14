import { createMachine, createActor, assign, not, stateIn, or } from "xstate";
import { Player } from "../@types/models";

const lobbyMachine = createMachine({
  id: "lobby",
  initial: "Empty",
  context: {
    players: [] as Array<Player>,
  },
  states: {
    Empty: { on: { playerJoins: { target: "OnePlayer" } } },
    OnePlayer: {
      on: {
        playerJoins: { target: "MultiplePlayers" },
        playerLeaves: { target: "Empty" },
      },
    },
    MultiplePlayers: {
      on: {
        playerClicksStart: "GameStart",
        playerLeaves: {
          guard: ({ context }) => context.players.length < 3,
          target: "OnePlayer",
        },
      },
    },
    GameStart: {},
  },
  always: {
    guard: not(stateIn("GameStart")),
    actions: ({ context, event }) => {
      console.log("\nAction:", event.type);
      switch (event.type) {
        case "playerJoins":
          context.players.push(event.player);
          break;
        case "playerLeaves":
          context.players = context.players.filter(
            (player) => player.socketId !== event.player.socketId,
          );
          break;
      }
    },
  },
});

// Creates an actor that you can send events to; not started yet!
const lobbyActor = createActor(lobbyMachine);

lobbyActor.subscribe((state) => {
  console.log("Value:", state.value);
  console.log("Context:", state.context.players);
});

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
  type: "playerLeaves",
  player: { socketId: "id-3", name: "a name-3" },
});

lobbyActor.send({
  type: "playerLeaves",
  player: { socketId: "id-2", name: "a name-2" },
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

lobbyActor.send({
  type: "playerClicksStart",
});

lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-5", name: "a name-5" },
});
