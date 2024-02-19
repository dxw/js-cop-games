import { assign, createMachine } from "xstate";

import type { Player } from "../@types/models";

const context = {
	players: [] as Player[],
};

type Context = typeof context;

type Events =
	| {
			player: Player;
			type: "playerJoins";
	  }
	| {
			socketId: Player["socketId"];
			type: "playerLeaves";
	  }
	| {
			type: "playerClicksStart";
	  };

const isNewPlayer = (
	{ players }: { players: Player[] },
	{ player: playerFromEvent }: { player: Player },
) =>
	players.find((player) => player.socketId === playerFromEvent.socketId) ===
	undefined;

const isOnlyPlayer = ({ players }: { players: Player[] }) =>
	players.length === 1;

const lobbyMachine = createMachine(
	{
		context: context,
		id: "lobby",
		initial: "empty",
		predictableActionArguments: true,
		schema: {
			context: {} as Context,
			events: {} as Events,
		},
		states: {
			empty: {
				on: { playerJoins: { actions: "addPlayer", target: "onePlayer" } },
			},
			multiplePlayers: {
				always: {
					cond: "isOnlyPlayer",
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
						cond: "isNewPlayer",
						target: "multiplePlayers",
					},
					playerLeaves: {
						actions: "removePlayer",
						target: "empty",
					},
				},
			},
		},
		tsTypes: {} as import("./lobby.typegen").Typegen0,
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

export { context, isNewPlayer, isOnlyPlayer, lobbyMachine };
