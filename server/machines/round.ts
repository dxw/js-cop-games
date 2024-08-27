import { assign, setup } from "xstate";
import type { Player, PlayerScore, Question } from "../@types/entities";
import questions from "../data/questions.json";
import type { getUpdatedPlayerScoresAndBonusPoints } from "../utils/scoringUtils";

const context = {
	questions: questions as Question[],
	playerScores: [] as PlayerScore[],
	selectedQuestion: {} as Question | undefined,
	bonusPoints: 0,
};

type Context = typeof context;

type TurnEndEvent = {
	type: "turnEnd";
	scoresAndBonusPoints: ReturnType<typeof getUpdatedPlayerScoresAndBonusPoints>;
};

type Events = TurnEndEvent;

type Input = { players: Player[] };

const dynamicParamFuncs = {
	setQuestion: ({ context }: { context: Context }) => {
		return { questions: context.questions };
	},
	updateScores: ({ event }: { event: TurnEndEvent }) => {
		return { ...event.scoresAndBonusPoints };
	},
};

const roundMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
		input: Input;
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
		updateScores: assign({
			bonusPoints: (
				_,
				params: ReturnType<typeof dynamicParamFuncs.updateScores>,
			) => params.bonusPoints,
			playerScores: (
				_,
				params: ReturnType<typeof dynamicParamFuncs.updateScores>,
			) => params.playerScores,
		}),
	},
}).createMachine({
	context: ({ input }) => ({
		...context,
		playerScores: input.players.map((player) => ({
			score: 0,
			player,
		})),
	}),
	id: "round",
	initial: "turn",
	states: {
		turn: {
			entry: [{ type: "setQuestion", params: dynamicParamFuncs.setQuestion }],
			on: {
				turnEnd: {
					target: "roundEnd",
					actions: {
						type: "updateScores",
						params: dynamicParamFuncs.updateScores,
					},
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

export { roundMachine };
