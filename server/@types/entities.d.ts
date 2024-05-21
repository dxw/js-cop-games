import type { Socket } from "socket.io";

type Answer = {
	colours: Colour[];
	socketId: Socket["id"];
};

type Colour =
	| "black"
	| "grey"
	| "white"
	| "red"
	| "orange"
	| "yellow"
	| "green"
	| "blue"
	| "purple"
	| "pink"
	| "brown";

type Player = {
	name: string;
	socketId: Socket["id"];
};

type Question = {
	answer: string[];
	number: number;
	question: string;
};

export type { Answer, Colour, Player, Question };
