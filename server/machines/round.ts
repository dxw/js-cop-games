import { assign, setup } from "xstate";
import type { Player, PlayerScore, Question } from "../@types/entities.d.ts";
import questions from "../data/questions.json";
import type { getUpdatedPlayerScoresAndBonusPoints } from "../utils/scoringUtils.ts";

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

export const betweenTurnsCountdownMs = 5000;

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
		startBetweenTurnsCountdown: () => {
			// Implementation is passed in on instantiation
		},
		stopBetweenTurnsCountdown: () => {
			// Implementation is passed in on instantiation
		},
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
			entry: { type: "startBetweenTurnsCountdown" },
			exit: { type: "stopBetweenTurnsCountdown" },
			after: { [betweenTurnsCountdownMs]: { target: "turn" } },
		},
		roundEnd: {
			type: "final",
		},
	},
});

export { roundMachine };
