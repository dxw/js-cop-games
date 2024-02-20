import type { Player, Question } from "../@types/models";
import type { Lobby } from "../lobby";

const clientboundEvents = {
	getPlayers: (
		lobby: Lobby,
	): ClientboundSocketServerEvent<{ players: Player["name"][] }> => {
		return ["players:get", { players: lobby.playerNames() }];
	},
	getQuestion: (
		question: Question,
	): ClientboundSocketServerEvent<{ question: Question }> => {
		return ["question:get", { question }];
	},
	setPlayer: (
		player: Player,
	): ClientboundSocketServerEvent<{ player: Player }> => {
		return ["player:set", { player }];
	},
	showStartButton: (): ClientboundSocketServerEvent => {
		return "game:startable";
	},
};

type Event = "game:startable" | "player:set" | "players:get" | "question:get";

type ClientboundSocketServerEvent<T = void> = T extends Record<string, unknown>
	? [Event, T]
	: Event;

export { clientboundEvents };
