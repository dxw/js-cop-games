type Player = {
  name: string;
  socketId: string;
};

type Question = {
  answer: Array<string>;
  number: number;
  question: string;
};

type Answer = {
  colours: Array<Colour>;
  socketId: SocketId;
};

type Colour = 'black' | 'blue' | 'brown' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'white' | 'yellow';

type SocketId = string;

export type { Answer, Colour, Player, Question };
