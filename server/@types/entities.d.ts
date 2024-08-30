import type { Socket } from "socket.io";
import type { TopLevelState } from "../models/lobby";

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
	sessionId: Session["id"];
};

type PlayerScore = {
	player: Player;
	score: number;
};

type Question = {
	colours: Colour[];
	subject: string;
};

type Session = {
	id: Id;
	userId: Id;
	username: Player["name"];
};

type Id = string;

type GameState = `${TopLevelState}:${string}`;

export type {
	Answer,
	Colour,
	Player,
	PlayerScore,
	Question,
	Session,
	GameState,
};
