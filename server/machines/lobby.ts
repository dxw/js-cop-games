import { EventObject, assign, createMachine } from "xstate";

import { GuardArgs } from "xstate/guards";
import type { Player } from "../@types/models";

const context = {
	players: [] as Player[],
};

type Context = typeof context;

type PlayerJoinsEvent = {
	player: Player;
	type: "playerJoins";
};

type Events =
	| PlayerJoinsEvent
	| {
			socketId: Player["socketId"];
			type: "playerLeaves";
	  }
	| {
			type: "playerClicksStart";
	  };

const isNewPlayer = (args: GuardArgs<Context, PlayerJoinsEvent>) =>
	args.context.players.find(
		(player) => player.socketId === args.event.player.socketId,
	) === undefined;

const isOnlyPlayer = (args: GuardArgs<Context, EventObject>) =>
	args.context.players.length === 1;

const lobbyMachine = createMachine(
	{
		context,
		id: "lobby",
		initial: "empty",
		types: {
			context: {} as Context,
			events: {} as Events,
			typegen: {} as import("./lobby.typegen").Typegen0,
		},
		states: {
			empty: {
				on: { playerJoins: { actions: "addPlayer", target: "onePlayer" } },
			},
			multiplePlayers: {
				always: {
					guard: "isOnlyPlayer",
					target: "onePlayer",
				},
				on: {
					playerJoins: { actions: "addPlayer" },
					playerLeaves: { actions: "removePlayer" },
				},
			},
			onePlayer: {
				on: {
					playerJoins: {
						actions: "addPlayer",
						guard: "isNewPlayer",
						target: "multiplePlayers",
					},
					playerLeaves: {
						actions: "removePlayer",
						target: "empty",
					},
				},
			},
		},
	},
	{
		actions: {
			addPlayer: assign({
				players: (args) => [...args.context.players, args.event.player],
			}),
			removePlayer: assign({
				players: (args) =>
					args.context.players.filter(
						(player) => player.socketId !== args.event.socketId,
					),
			}),
		},
		guards: {
			isNewPlayer,
			isOnlyPlayer,
		},
	},
);

export { context, isNewPlayer, isOnlyPlayer, lobbyMachine };
