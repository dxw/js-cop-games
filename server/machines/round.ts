import type { Socket } from "socket.io";
import { assign, setup } from "xstate";
import type { Answer, Question } from "../@types/entities";
import questions from "../data/questions.json";
const context = {
	questions: questions as Question[],
	selectedQuestion: {} as Question | undefined,
	scores: {} as Record<Socket["id"], number>,
};

type Context = typeof context;

type Events = {
	type: "turnEnd";
	answers: Answer[];
};

const dynamicParamFuncs = {
	setQuestion: ({ context }: { context: Context }) => {
		return { questions: context.questions };
	},
	// TODO: updateScores
};
// players are awarded one point for each person who guesses wrong plus any points from the bonus round
// show what answers every gave
// there could be no correct answers - bonus points are then reset
// all players could be correct and no score would be awarded but 1 point is added to the next round
// first to 10

// count how many players have correct answers
// if 0 correct answers set bonus points to 0 -> check win conditions -> next question
// if all answers are correct ++bonus points -> check win conditions -> next question
// if there are some correct and some incorrect answers add the number of incorrect answers (+ any bonus points - then reset bonus points) to the scores of the players with correct answers -> check win conditions -> next question

const roundMachine = setup({
	types: {} as {
		context: Context;
		events: Events;
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
				// can we splice the selected question out of the questions array with params.questions.splice[questionIndex, 1]?
				return params.questions[questionIndex];
			},
		}),
		updateScores: assign({
			// TODO
		}),
	},
	guards: {
		noClearWinner: {
			// TODO - need to work out how to transition into a new turn either here or in the model
		},
	},
}).createMachine({
	context,
	id: "round",
	initial: "turn",
	states: {
		turn: {
			entry: [{ type: "setQuestion", params: dynamicParamFuncs.setQuestion }], // keep track of which questions have been asked in round and/or entire game/lobby]
			on: {
				turnEnd: {
					target: "finished",
					actions: {
						type: "updateScores",
						params: dynamicParamFuncs.updateScores,
					},
					guard: {
						type: "noClearWinner",
						params: dynamicParamFuncs.noClearWinner,
					},
				},
			},
		},
		finished: {
			type: "final",
		},
	},
});

export { context, roundMachine };
