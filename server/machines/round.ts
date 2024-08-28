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
	clearWinner: ({ context }: { context: Context }) => {
		return { playerScores: context.playerScores };
	},
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
	guards: {
		clearWinner: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.clearWinner>,
		) => {
			const currentMaximumScore = { score: 0, playersWithScore: 0 };

			for (const { score } of params.playerScores) {
				if (score === currentMaximumScore.score) {
					currentMaximumScore.playersWithScore++;
				}

				if (score > currentMaximumScore.score) {
					currentMaximumScore.score = score;
					currentMaximumScore.playersWithScore = 1;
				}
			}

			return (
				currentMaximumScore.score >= 10 &&
				currentMaximumScore.playersWithScore === 1
			);
		},
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
			entry: { type: "setQuestion", params: dynamicParamFuncs.setQuestion },
			on: {
				turnEnd: {
					actions: {
						type: "updateScores",
						params: dynamicParamFuncs.updateScores,
					},
					target: "checkForWinner",
				},
			},
		},
		checkForWinner: {
			always: [
				{
					guard: {
						type: "clearWinner",
						params: dynamicParamFuncs.clearWinner,
					},
					target: "roundEnd",
				},
			],
			after: { [5000]: { target: "turn" } },
		},
		roundEnd: {
			type: "final",
		},
	},
});

export { roundMachine };
