import { assign, setup } from "xstate";
import type { Answer, Question } from "../@types/entities";

const context = {
	answers: [] as Answer[],
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
};

const turnMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
	},
	actions: {
		addAnswer: assign({
			answers: (_, params: ReturnType<typeof dynamicParamFuncs.addAnswer>) => [
				...params.currentAnswers,
				params.newAnswer,
			],
		}),
	},
}).createMachine({
	context,
	id: "turn",
	initial: "noAnswers",
	states: {
		noAnswers: {
			on: {
				playerSubmitsAnswer: {
					actions: { type: "addAnswer", params: dynamicParamFuncs.addAnswer },
					target: "answerSubmitted",
				},
			},
		},
		answerSubmitted: {
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

export { turnMachine };
