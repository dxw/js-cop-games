import { assign, setup } from "xstate";
import type { Player, Session } from "../@types/entities";
import { roundMachine } from "./round";

const context = {
	players: [] as Player[],
};

type Context = typeof context;

type PlayerJoinsEvent = {
	player: Player;
	type: "playerJoins";
};

type PlayerLeavesEvent = {
	sessionId: Session["id"];
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
		return {
			players: context.players,
			playerSessionIdToRemove: event.sessionId,
		};
	},
	isNewPlayer: ({
		context,
		event,
	}: { context: Context; event: PlayerJoinsEvent }) => {
		return {
			players: context.players,
			maybeNewPlayerSessionId: event.player.sessionId,
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
					(player: Player) =>
						player.sessionId !== params.playerSessionIdToRemove,
				),
		}),
	},
	guards: {
		isNewPlayer: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.isNewPlayer>,
		) =>
			params.players.find(
				(player) => player.sessionId === params.maybeNewPlayerSessionId,
			) === undefined,
		isOnlyPlayer: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.isOnlyPlayer>,
		) => params.players.length === 1,
	},
	actors: {
		roundMachine,
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
				playerClicksStart: {
					target: "round",
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
		round: {
			invoke: {
				id: "roundMachine",
				src: "roundMachine",
				input: (snapshot) => ({ players: snapshot.context.players }),
			},
		},
	},
});

export { lobbyMachine };
