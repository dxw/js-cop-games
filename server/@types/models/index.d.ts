type Player = {
  name: string;
  socketId: string;
};

type Question = {
  answer: Array<string>;
  number: number;
  question: string;
};

export type { Player, Question };
