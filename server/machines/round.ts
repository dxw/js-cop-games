import { assign, createMachine } from "xstate";
import { Answer } from "../@types/models";
import questions from "../data/questions.json";

type Question = {
	answer: string[];
	number: number;
	question: string;
};

const context = {
	answers: [] as Answer[],
	questions: questions as Question[],
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
		types: {
			context: {} as Context,
			events: {} as Events,
			typegen: {} as import("./round.typegen").Typegen0,
		},
		states: {
			roundStart: {
				entry: ["setQuestion"],
				on: {
					playerSubmitsAnswer: { actions: "addAnswer" },
				},
			},
		},
	},
	{
		actions: {
			addAnswer: assign({
				answers: (args) => [...args.context.answers, args.event.answer],
			}),
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

export { context, roundMachine };
