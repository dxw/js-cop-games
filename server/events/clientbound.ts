import type { Player, Question } from "../@types/models";
import type { Lobby } from "../lobby";

const clientboundEvents = {
	getPlayers: (lobby: Lobby): [string, { players: Player["name"][] }] => {
		return ["players:get", { players: lobby.playerNames() }];
	},
	getQuestion: (question: Question): [string, { question: Question }] => {
		return ["question:get", { question }];
	},
	setPlayer: (player: Player): [string, { player: Player }] => {
		return ["player:set", { player }];
	},
	showStartButton: (): string => {
		return "game:startable";
	},
};

export { clientboundEvents };
