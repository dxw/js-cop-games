import { assign, createMachine } from "xstate";
import { Answer } from "../@types/models";

type Question = {
	answer: string[];
	number: number;
	question: string;
};

const context = {
	answers: [] as Answer[],
	questions: [] as Question[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type Events = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

const gameMachine = createMachine(
	{
		context,
		id: "game",
		initial: "gameStart",
		predictableActionArguments: true,
		schema: {
			context: {} as Context,
			events: {} as Events,
		},
		states: {
			gameStart: {
				entry: ["setQuestion"],
				on: {
					playerSubmitsAnswer: { actions: "addAnswer" },
				},
			},
		},
		tsTypes: {} as import("./round.typegen").Typegen0,
	},
	{
		actions: {
			addAnswer: assign({
				answers: (context, event) => [...context.answers, event.answer],
			}),
			setQuestion: assign({
				selectedQuestion: ({ questions }) => {
					const questionIndex = Math.floor(
						Math.random() * (questions.length - 1),
					);
					return questions[questionIndex];
				},
			}),
		},
	},
);

export { context, gameMachine };
