import { assign, createMachine } from 'xstate';
import { Answer, Question } from '../@types/models';

const context = {
  questions: [] as Array<Question>,
  selectedQuestion: {} as Question | undefined,
  answers: [] as Array<Answer>
};

type Context = typeof context;

type Events = {
  type: 'playerSubmitsAnswer';
  answer: Answer;
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
      Countdown: {
        on: {
          playerSubmitsAnswer: { actions: 'addAnswer' }
        }
      },
      GameStart: {
        entry: ['setQuestion'],
        on: {
          playerSubmitsAnswer: { actions: 'addAnswer', target: 'Countdown' }
        }
      },
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./round.typegen').Typegen0,
  },
  {
    actions: {
      addAnswer: assign({
        answers: ({ answers }, { answer }) => [...answers, answer]
      }),
      setQuestion: assign({
        selectedQuestion: ({ questions }) => {
          const questionIndex = Math.floor(Math.random() * (questions.length - 1));
          return questions[questionIndex];
        },
      }),
    }
  },
);

export { context, gameMachine };
