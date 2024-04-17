import { assign, createMachine, setup } from "xstate";
import type { Answer } from "../@types/entities";

type Question = {
	answer: string[];
	number: number;
	question: string;
};

const turnContext = {
	answers: [] as Answer[],
	selectedQuestion: {} as Question | undefined,
};

const roundContext = {
	questions: [] as Question[],
	selectedQuestion: {} as Question | undefined,
};

type TurnContext = typeof turnContext;
type RoundContext = typeof roundContext;

type Event = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

const turnMachine = createMachine(
	{
		context: turnContext,
		id: "turn",
		initial: "turnStart",
		types: {
			context: {} as TurnContext,
			events: {} as Event,
			typegen: {} as import("./round.typegen").Typegen0,
		},
		states: {
			turnStart: {
				entry: ["setQuestion"],
				on: {
					playerSubmitsAnswer: { actions: "addAnswer", target: "countdown" },
				},
			},
			countdown: {
				on: {
					playerSubmitsAnswer: { actions: "addAnswer" },
				},
				after: {
					[15000]: { target: "finished" },
				},
			},
			finished: {
				type: "final",
			},
		},
	},
	{
		actions: {
			addAnswer: assign({
				answers: (args) => [...args.context.answers, args.event.answer],
			}),
		},
	},
);

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
	actors: {
		turn: turnMachine,
	},
}).createMachine(
	{
		context: roundContext,
		id: "round",
		initial: "roundStart",
		types: {
			context: {} as RoundContext,
			events: {} as Event,
			typegen: {} as import("./round.typegen").Typegen0,
		},
		states: {
			roundStart: {
				entry: ["setQuestion"],
				invoke: {
					id: "turn",
					src: "turn",
					input: ({ context }) => ({
						selectedQuestion: context.selectedQuestion,
					}),
					onDone: {
						target: "success",
						actions: assign({ user: ({ event }) => event.output }),
					},
					onError: {
						target: "failure",
						actions: assign({ error: ({ event }) => event.error }),
					},
				},
			},
			countdown: {
				on: {
					playerSubmitsAnswer: { actions: "addAnswer" },
				},
				after: {
					[15000]: { target: "finished" },
				},
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
					return args.context.questions[questionIndex];
				},
			}),
		},
	},
);

export { turnContext as context, turnMachine as roundMachine };
