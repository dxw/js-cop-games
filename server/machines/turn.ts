import { assign, setup } from "xstate";
import type { Answer, Player, Question } from "../@types/entities";

const context = {
	answers: [] as Answer[],
	correctPlayerSocketIds: [] as Player["socketId"][],
	selectedQuestion: {} as Question,
};

type Context = typeof context;

type PlayerSubmitsAnswerEvent = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

type Events = PlayerSubmitsAnswerEvent;

type Input = { selectedQuestion: Question };

const dynamicParamFuncs = {
	addAnswer: ({
		context,
		event,
	}: { context: Context; event: PlayerSubmitsAnswerEvent }) => {
		return { currentAnswers: context.answers, newAnswer: event.answer };
	},
	recordCorrectPlayers: ({ context }: { context: Context }) => ({
		finalAnswers: context.answers,
		correctAnswer: context.selectedQuestion?.colours,
	}),
};

const turnMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
		input: Input;
	},
	actions: {
		addAnswer: assign({
			answers: (_, params: ReturnType<typeof dynamicParamFuncs.addAnswer>) => [
				...params.currentAnswers,
				params.newAnswer,
			],
		}),
		recordCorrectPlayers: assign({
			correctPlayerSocketIds: (
				_,
				params: ReturnType<typeof dynamicParamFuncs.recordCorrectPlayers>,
			) => {
				return params.finalAnswers
					.filter((answer) => {
						if (params.correctAnswer.length !== answer.colours.length) {
							return false;
						}

						return params.correctAnswer.every((colour) =>
							answer.colours.includes(colour),
						);
					})
					.map((answer) => answer.socketId);
			},
		}),
	},
}).createMachine({
	context: ({ input }) => ({ ...context, ...input }),
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
		finished: {
			type: "final",
			entry: [
				{
					type: "recordCorrectPlayers",
					params: dynamicParamFuncs.recordCorrectPlayers,
				},
			],
		},
	},
});

export { turnMachine };
