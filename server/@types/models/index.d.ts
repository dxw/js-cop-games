import type { Socket } from "socket.io";

type Player = {
	name: string;
	socketId: Socket["id"];
};

type Question = {
	answer: string[];
	number: number;
	question: string;
};

export type { Player, Question };
