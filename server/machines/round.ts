import { assign, createMachine } from "xstate";
import type { Answer, Question } from "../@types/entities";
import questions from "../data/questions.json";

const context = {
	answers: [] as Answer[],
	questions: questions as Question[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type Event = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

const roundMachine = createMachine(
	{
		context,
		id: "round",
		initial: "roundStart",
		types: {
			context: {} as Context,
			events: {} as Event,
		},
		states: {
			roundStart: {
				entry: ["setQuestion"],
				on: {
					playerSubmitsAnswer: { actions: "addAnswer", target: "countdown" },
				},
			},
			countdown: {
				on: {
					playerSubmitsAnswer: { actions: "addAnswer" },
				},
				after: {
					[15000]: { target: "finished" },
				},
			},
			finished: {
				type: "final",
			},
		},
	},
	{
		actions: {
			addAnswer: assign({
				answers: (args) => [...args.context.answers, args.event.answer],
			}),
			setQuestion: assign({
				selectedQuestion: (args) => {
					const questionIndex = Math.floor(
						Math.random() * (args.context.questions.length - 1),
					);
					return args.context.questions[questionIndex];
				},
			}),
		},
	},
);

export { context, roundMachine };
