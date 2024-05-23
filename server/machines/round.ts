import { assign, createMachine } from "xstate";
import type { Question } from "../@types/entities";
import questions from "../data/questions.json";
const context = {
	questions: questions as Question[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

// players are awarded one point for each person who guesses wrong plus any points from the bonus round
// show what answers every gave
// there could be no correct answers - bonus points are then reset
// all players could be correct and no score would be awarded but 1 point is added to the next round
// first to 10

// count how many players have correct answers
// if 0 correct answers set bonus points to 0 -> check win conditions -> next question
// if all answers are correct ++bonus points -> check win conditions -> next question
// if there are some correct and some incorrect answers add the number of incorrect answers (+ any bonus points - then reset bonus points) to the scores of the players with correct answers -> check win conditions -> next question

const roundMachine = createMachine(
	{
		context: context,
		id: "round",
		initial: "turn",
		types: {
			context: {} as Context,
			events: {} as Event,
		},
		states: {
			turn: {
				entry: ["setQuestion"], // keep track of which questions have been asked in round and/or entire game/lobby]
				on: {
					turnEnd: { target: "finished", actions: ["processTurn"] },
				},
				// invoke: {
				// 	id: "turn",
				// 	src: turnMachine,
				// 	input: ({ context }) => ({
				// 		selectedQuestion: context.selectedQuestion,
				// 	}),
				// 	onDone: {
				// 		target: "finished",
				// 		actions: "processTurn", // need to receive answers from turn machine
				// 	},
				// },
				// guard: if win conditions, finished
			},
			finished: {
				type: "final",
			},
		},
	},
	{
		actions: {
			setQuestion: assign({
				selectedQuestion: (args) => {
					const questionIndex = Math.floor(
						Math.random() * (args.context.questions.length - 1),
					);
					// we can splice the selected question out of the questions array with args.context.questions.splice[questionIndex, 1]
					return args.context.questions[questionIndex];
				},
			}),
			processTurn: () => console.log("processing turn"),
		},
	},
);

export { context, roundMachine };
