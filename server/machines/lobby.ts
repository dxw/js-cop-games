import { createMachine, createActor, assign, not, stateIn, or } from "xstate";
import { Player } from "../@types/models";

const lobbyMachine = createMachine({
  id: "lobby",
  initial: "Empty",
  context: {
    players: [] as Array<Player>,
  },
  states: {
    Empty: { on: { playerJoins: { target: "HasPlayers" } } },
    HasPlayers: { on: { playerJoins: { target: "ReadyToPlay" } } },
    ReadyToPlay: { on: { playerClicksStart: "GameStart" } },
    GameStart: {},
  },
  always: {
    guard: not(stateIn("GameStart")),
    actions: ({ context, event }) => {
      if (event.type === "playerJoins") {
        context.players.push(event.player);
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

console.log("\nAction: actor starts");
lobbyActor.start(); // logs 'Inactive'

console.log("\nAction: player joins");
lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id", name: "a name" },
});

console.log("\nAction: player joins");
lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-2", name: "a name-2" },
});

console.log("\nAction: player joins");
lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-3", name: "a name-3" },
});

console.log("\nAction: player joins");
lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-4", name: "a name-4" },
});

console.log("\nAction: player clicks start");
lobbyActor.send({
  type: "playerClicksStart",
});

console.log("\nAction: player joins");
lobbyActor.send({
  type: "playerJoins",
  player: { socketId: "id-4", name: "a name-4" },
});
