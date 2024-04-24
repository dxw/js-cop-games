import { assign, createMachine } from "xstate";
import type { Answer, Question } from "../@types/entities";

const context = {
	answers: [] as Answer[],
	selectedQuestion: {} as Question | undefined,
};

type Context = typeof context;

type Event = {
	type: "playerSubmitsAnswer";
	answer: Answer;
};

const turnMachine = createMachine(
	{
		context: context,
		id: "turn",
		initial: "turnStart",
		types: {
			context: {} as Context,
			events: {} as Event,
			typegen: {} as import("./round.typegen").Typegen0,
		},
		states: {
			turnStart: {
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
				// pass answers back to round machine
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

export { context, turnMachine };
