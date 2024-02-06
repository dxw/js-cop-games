import { assign, createMachine } from 'xstate';

import type { Answer, Question } from '../@types/models';

const context = {
  questions: [] as Array<Question>,
  selectedQuestion: {} as Question | undefined,
  answers: [] as Array<Answer>,
};

type Context = typeof context;

type Events = {
  type: 'playerSubmitsAnswer';
  answer: Answer;
};

const gameMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDoDCB7ArgHYAuEuA7oQMQAOANigJ5gBOAyvgEZoCWxsAQUKxyrANoAGALqJQNXLD49chWSAAeiACwBWHZgAcBiQCZTOgGwB2HQEYDJgDQhGiA7cwBmEyYCcEnS0DG09bE08AXwjnVAwcAhIySip1WGIUYiwUADNMlgAKWx0JEoBKKlisPCJSCkJJGSQQeUViZVUmzQQJZ1duqJj0LABxIbZ0lmJaBmZ2Ll5+IRFxaTUWpRU1LpMtCUw7QPcJTysJIJMLXsQik0wJCy1wz0ed0IkrKOiQQlwIODVKmsFBsOqAugBaIJXBDg4JeHz+AzeXwmWxWEwGAYgSrxGpJUHNYFtTadbS+LSYKxWXzkh7+M47aH2DwWXw6PxaTl6amYr440YYcYoSZA1rtLbaJwua52O6PCS+AwWOwlEoWLE4gBiPEIPFgAAtIKKQRKEAYKXoDDoUVoLLYJEjLNDfB4rEZTi6zgF3iZPhEgA */
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
          playerSubmitsAnswer: { actions: 'addAnswer' },
        },
        after: {
          [15000]: { target: 'Finished' },
        },
      },
      GameStart: {
        entry: ['setQuestion'],
        on: {
          playerSubmitsAnswer: { actions: 'addAnswer', target: 'Countdown' },
        },
      },
      Finished: {},
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./round.typegen').Typegen0,
  },
  {
    actions: {
      addAnswer: assign({
        answers: ({ answers }, { answer }) => [...answers, answer],
      }),
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
