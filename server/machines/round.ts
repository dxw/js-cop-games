import { assign, setup } from "xstate";
import type { PlayerScore, Question } from "../@types/entities";
import questions from "../data/questions.json";

const context = {
	questions: questions as Question[],
	playerScores: [] as PlayerScore[],
	selectedQuestion: {} as Question | undefined,
	bonusPoints: 0,
};

type Context = typeof context;

const dynamicParamFuncs = {
	setQuestion: ({ context }: { context: Context }) => {
		return { questions: context.questions };
	},
};

const roundMachine = setup({
	types: {} as {
		context: Context;
	},

	actions: {
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
	initial: "turn",
	states: {
		turn: {
			entry: [{ type: "setQuestion", params: dynamicParamFuncs.setQuestion }],
			on: {
				turnEnd: {
					target: "roundEnd",
					// guard: (_, __) => {
					// 	check to see if round end conditions are met
					// },
				},
			},
		},
		roundEnd: {
			type: "final",
		},
	},
});

export { context, roundMachine };
