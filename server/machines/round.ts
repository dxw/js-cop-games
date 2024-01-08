import { assign, createMachine } from "xstate";

type Question = {
  answer: Array<string>;
  number: number;
  question: string;
};

export const context = {
  questions: [] as Array<Question>,
  selectedQuestion: {} as Question | undefined,
};

export type Context = typeof context;

export type Events = any;

export const gameMachine = createMachine(
  {
    tsTypes: {} as import("./round.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as Events,
    },
    predictableActionArguments: true,
    id: "game",
    initial: "GameStart",
    context,
    states: {
      GameStart: {
        entry: ["setQuestion"],
      },
    },
  },
  {
    actions: {
      setQuestion: assign({
        selectedQuestion: ({ questions }) => {
          const questionIndex = Math.floor(
            Math.random() * (questions.length - 1),
          );
          return questions[questionIndex];
        },
      }),
    },
  },
);
