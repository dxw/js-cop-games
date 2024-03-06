import { Socket } from "socket.io";

type Answer = {
	colours: Colour[];
	socketId: Socket["id"];
};

type Colour =
	| "black"
	| "blue"
	| "brown"
	| "green"
	| "grey"
	| "orange"
	| "pink"
	| "purple"
	| "red"
	| "white"
	| "yellow";

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
