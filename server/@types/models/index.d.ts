type Player = {
	name: string;
	socketId: string;
};

type Question = {
	answer: string[];
	number: number;
	question: string;
};

export type { Player, Question };
