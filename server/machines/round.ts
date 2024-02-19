import { assign, createMachine } from "xstate";

type Question = {
	answer: string[];
	number: number;
	question: string;
};

const context = {
	questions: [] as Question[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type Events = {
	type: string;
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
			},
		},
		tsTypes: {} as import("./round.typegen").Typegen0,
	},
	{
		actions: {
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
