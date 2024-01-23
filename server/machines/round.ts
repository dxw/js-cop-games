import { assign, createMachine } from 'xstate';

type Question = {
  answer: Array<string>;
  number: number;
  question: string;
};

const context = {
  questions: [] as Array<Question>,
  selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type Events = {
  type: string;
};

const gameMachine = createMachine(
  {
    context,
    id: 'game',
    initial: 'GameStart',
    predictableActionArguments: true,
    schema: {
      context: {} as Context,
      events: {} as Events,
    },
    states: {
      GameStart: {
        entry: ['setQuestion'],
      },
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./round.typegen').Typegen0,
  },
  {
    actions: {
      setQuestion: assign({
        selectedQuestion: ({ questions }) => {
          const questionIndex = Math.floor(Math.random() * (questions.length - 1));
          return questions[questionIndex];
        },
      }),
    },
  },
);

export { context, gameMachine };
