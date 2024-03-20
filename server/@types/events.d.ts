import { Colour, Player, Question } from "./entities";

export interface ClientboundSocketServerEvents {
	"round:startable": () => void;
	"round:start": () => void;
	"player:set": (player: Player) => void;
	"players:get": (playerNames: Player["name"][]) => void;
	"question:get": (question: Question) => void;
	"answers:post": (playerId: string, colours: string[]) => void;
}

export interface ServerboundSocketServerEvents {
	"answers:post": (colours: Colour[]) => void;
	disconnect: () => void;
	"players:post": (name: Player["name"]) => void;
	"round:start": () => void;
}
