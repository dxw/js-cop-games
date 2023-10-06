type Player = {
  socketId: string;
  name: string;
};

type Question = {
  question: string;
  answer: Array<string>;
  number: number;
};

export type { Player, Question };
