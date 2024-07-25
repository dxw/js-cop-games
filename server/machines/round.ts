import { assign, setup } from "xstate";
import type { Answer, Question } from "../@types/entities";
import questions from "../data/questions.json";

const context = {
	answers: [] as Answer[],
	questions: questions as Question[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type PlayerSubmitsAnswerEvent = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

type Events = PlayerSubmitsAnswerEvent;

const dynamicParamFuncs = {
	addAnswer: ({
		context,
		event,
	}: { context: Context; event: PlayerSubmitsAnswerEvent }) => {
		return { currentAnswers: context.answers, newAnswer: event.answer };
	},
	setQuestion: ({ context }: { context: Context }) => {
		return { questions: context.questions };
	},
};

const roundMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
	},

	actions: {
		// add this one to dynamicParamFuncs
		addAnswer: assign({
			answers: (_, params: ReturnType<typeof dynamicParamFuncs.addAnswer>) => [
				...params.currentAnswers,
				params.newAnswer,
			],
		}),
		setQuestion: assign({
			selectedQuestion: (
				_,
				params: ReturnType<typeof dynamicParamFuncs.setQuestion>,
			) => {
				const questionIndex = Math.floor(
					Math.random() * (params.questions.length - 1),
				);
				return params.questions[questionIndex];
			},
		}),
	},
}).createMachine({
	context,
	id: "round",
	initial: "roundStart",
	states: {
		roundStart: {
			entry: [{ type: "setQuestion", params: dynamicParamFuncs.setQuestion }],
			on: {
				playerSubmitsAnswer: {
					actions: { type: "addAnswer", params: dynamicParamFuncs.addAnswer },
					target: "countdown",
				},
			},
		},
		countdown: {
			on: {
				playerSubmitsAnswer: {
					actions: { type: "addAnswer", params: dynamicParamFuncs.addAnswer },
				},
			},
			after: { [15000]: { target: "finished" } },
		},
		finished: { type: "final" },
	},
});

export { context, roundMachine };
