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

const roundMachine = createMachine(
	{
		context,
		id: "round",
		initial: "roundStart",
		predictableActionArguments: true,
		schema: {
			context: {} as Context,
			events: {} as Events,
		},
		states: {
			roundStart: {
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
				selectedQuestion: (context) => {
					const questionIndex = Math.floor(
						Math.random() * (context.questions.length - 1),
					);
					return context.questions[questionIndex];
				},
			}),
		},
	},
);

export { context, roundMachine };
