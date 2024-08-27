import type { Colour, Player, PlayerScore, Question } from "./entities";

export interface ClientboundSocketServerEvents {
	"answers:post": (playerId: string, colours: string[]) => void;
	"lobby:unjoinable": () => void;
	"player:set": (player: Player) => void;
	"players:get": (playerNames: Player["name"][]) => void;
	"question:get": (question: Question) => void;
	"round:reset": () => void;
	"round:start": () => void;
	"round:startable": () => void;
	"scoresAndBonusPoints:get": (
		playerScores: PlayerScore[],
		bonusPoints: number,
	) => void;
}

export interface ServerboundSocketServerEvents {
	"answers:post": (colours: Colour[]) => void;
	disconnect: () => void;
	"players:post": (name: Player["name"]) => void;
	"round:reset": () => void;
	"round:start": () => void;
}
