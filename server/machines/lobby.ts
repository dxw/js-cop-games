import { assign, setup } from "xstate";
import type { Player } from "../@types/entities";

const context = {
	players: [] as Player[],
};

type Context = typeof context;

type PlayerJoinsEvent = {
	player: Player;
	type: "playerJoins";
};

type PlayerLeavesEvent = {
	socketId: Player["socketId"];
	type: "playerLeaves";
};

type Events =
	| PlayerJoinsEvent
	| PlayerLeavesEvent
	| {
			type: "playerClicksStart";
	  };

const dynamicParamFuncs = {
	addPlayer: ({
		context,
		event,
	}: { context: Context; event: PlayerJoinsEvent }) => {
		return { players: context.players, player: event.player };
	},
	removePlayer: ({
		context,
		event,
	}: { context: Context; event: PlayerLeavesEvent }) => {
		return { players: context.players, playerSocketIdToRemove: event.socketId };
	},
	isNewPlayer: ({
		context,
		event,
	}: { context: Context; event: PlayerJoinsEvent }) => {
		return {
			players: context.players,
			maybeNewPlayerSocketId: event.player.socketId,
		};
	},
	isOnlyPlayer: ({ context }: { context: Context }) => {
		return { players: context.players };
	},
};

const lobbyMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
	},

	actions: {
		addPlayer: assign({
			players: (_, params: ReturnType<typeof dynamicParamFuncs.addPlayer>) => [
				...params.players,
				params.player,
			],
		}),
		removePlayer: assign({
			players: (_, params: ReturnType<typeof dynamicParamFuncs.removePlayer>) =>
				params.players.filter(
					(player: Player) => player.socketId !== params.playerSocketIdToRemove,
				),
		}),
	},
	guards: {
		isNewPlayer: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.isNewPlayer>,
		) =>
			params.players.find(
				(player) => player.socketId === params.maybeNewPlayerSocketId,
			) === undefined,
		isOnlyPlayer: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.isOnlyPlayer>,
		) => params.players.length === 1,
	},
}).createMachine({
	context,
	id: "lobby",
	initial: "empty",
	states: {
		empty: {
			on: {
				playerJoins: {
					actions: {
						type: "addPlayer",
						params: dynamicParamFuncs.addPlayer,
					},
					target: "onePlayer",
				},
			},
		},

		multiplePlayers: {
			always: {
				guard: {
					type: "isOnlyPlayer",
					params: dynamicParamFuncs.isOnlyPlayer,
				},
				target: "onePlayer",
			},
			on: {
				playerJoins: {
					actions: {
						type: "addPlayer",
						params: dynamicParamFuncs.addPlayer,
					},
				},
				playerLeaves: {
					actions: {
						type: "removePlayer",
						params: dynamicParamFuncs.removePlayer,
					},
				},
			},
		},
		onePlayer: {
			on: {
				playerJoins: {
					actions: {
						type: "addPlayer",
						params: dynamicParamFuncs.addPlayer,
					},
					guard: {
						type: "isNewPlayer",
						params: dynamicParamFuncs.isNewPlayer,
					},
					target: "multiplePlayers",
				},
				playerLeaves: {
					actions: {
						type: "removePlayer",
						params: dynamicParamFuncs.removePlayer,
					},
					target: "empty",
				},
			},
		},
	},
});

export { context, lobbyMachine };
