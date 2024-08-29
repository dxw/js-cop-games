import { assign, setup } from "xstate";
import type { Answer, Player, Question } from "../@types/entities";
import { getCorrectSocketIdsFromAnswers } from "../utils/scoringUtils";

const context = {
	answers: [] as Answer[],
	correctPlayerSocketIds: [] as Player["socketId"][],
	playerCount: 0,
	selectedQuestion: {} as Question,
};

type Context = typeof context;

type PlayerSubmitsAnswerEvent = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

type Events = PlayerSubmitsAnswerEvent;

type Input = { playerCount: number; selectedQuestion: Question };

type Output = { correctPlayerSocketIds: Player["socketId"][] };

const dynamicParamFuncs = {
	addAnswer: ({
		context,
		event,
	}: { context: Context; event: PlayerSubmitsAnswerEvent }) => {
		return { currentAnswers: context.answers, newAnswer: event.answer };
	},
	allPlayersAnswered: ({ context }: { context: Context }) => {
		return {
			answerCount: context.answers.length,
			playerCount: context.playerCount,
		};
	},
	recordCorrectPlayers: ({ context }: { context: Context }) => ({
		finalAnswers: context.answers,
		correctAnswer: context.selectedQuestion?.colours,
	}),
};

export const turnEndCountdownMs = 15000;

const turnMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
		input: Input;
		output: Output;
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
				return getCorrectSocketIdsFromAnswers(
					params.finalAnswers,
					params.correctAnswer,
				);
			},
		}),
		startTurnEndCountdown: () => {
			// passed on instantiation of the machine
		},
	},
	guards: {
		allPlayersAnswered: (
			_,
			params: ReturnType<typeof dynamicParamFuncs.allPlayersAnswered>,
		) => {
			return params.answerCount === params.playerCount;
		},
	},
}).createMachine({
	context: ({ input }) => ({ ...context, ...input }),
	id: "turn",
	initial: "noAnswers",
	states: {
		noAnswers: {
			on: {
				playerSubmitsAnswer: {
					actions: [
						{ type: "addAnswer", params: dynamicParamFuncs.addAnswer },
						{ type: "startTurnEndCountdown" },
					],
					target: "answerSubmitted",
				},
			},
		},
		answerSubmitted: {
			always: {
				guard: {
					type: "allPlayersAnswered",
					params: dynamicParamFuncs.allPlayersAnswered,
				},
				target: "finished",
			},
			on: {
				playerSubmitsAnswer: {
					actions: { type: "addAnswer", params: dynamicParamFuncs.addAnswer },
				},
			},
			after: { [turnEndCountdownMs]: { target: "finished" } },
		},
		finished: {
			type: "final",
			entry: {
				type: "recordCorrectPlayers",
				params: dynamicParamFuncs.recordCorrectPlayers,
			},
		},
	},
	output: ({ context }) => ({
		correctPlayerSocketIds: context.correctPlayerSocketIds,
	}),
});

export { turnMachine };
