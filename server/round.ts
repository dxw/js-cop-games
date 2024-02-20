import type { InterpreterFrom } from "xstate";
import { interpret } from "xstate";

import { Answer, Question } from "./@types/models";
import questions from "./data/questions.json";
import { context, roundMachine } from "./machines/round";
import type { SocketServer } from "./socketServer";

class Round {
	machine: InterpreterFrom<typeof roundMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = interpret(
			roundMachine.withContext({ ...context, questions }),
		).start();

		this.machine.onTransition((state) => {
			console.info({ context: state.context, state: state.value });

			switch (state.value) {
				case "roundStart": {
					this.server.onQuestionSet(
						this.machine.getSnapshot().context.selectedQuestion as Question,
					);
					break;
				}
				default:
					break;
			}
		});
	}

	addAnswer(answer: Answer) {
		this.machine.send({ type: "playerSubmitsAnswer", answer });
	}
}

export { Round };
