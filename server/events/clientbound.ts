import type { Player, Question } from "../@types/models";
import type { Lobby } from "../lobby";

const clientboundEvents = {
	getPlayers: (lobby: Lobby): ClientboundSocketServerEvent<"players:get"> => {
		return ["players:get", { players: lobby.playerNames() }];
	},
	getQuestion: (
		question: Question,
	): ClientboundSocketServerEvent<"question:get"> => {
		return ["question:get", { question }];
	},
	setPlayer: (player: Player): ClientboundSocketServerEvent<"player:set"> => {
		return ["player:set", { player }];
	},
	showStartButton: (): ClientboundSocketServerEvent<"round:startable"> => {
		return "round:startable";
	},
};

type Event = "round:startable" | "player:set" | "players:get" | "question:get";

type Payloads = {
	"question:get": { question: Question };
	"players:get": { players: Player["name"][] };
	"player:set": { player: Player };
};

type ClientboundSocketServerEvent<T = Event> = T extends keyof Payloads
	? [T, Payloads[T]]
	: T;

export { clientboundEvents };
