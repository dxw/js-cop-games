import type { Actor } from "xstate";
import { createActor } from "xstate";

import { Answer, Question } from "./@types/models";
import { context, gameMachine } from "./machines/round";
import type { SocketServer } from "./socketServer";

class Round {
	machine: Actor<typeof gameMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(gameMachine, { ...context });
		this.machine.subscribe((state) => {
			console.info({ context: state.context, state: state.value });

			switch (state.value) {
				case "gameStart": {
					this.server.onQuestionSet(
						this.machine.getSnapshot().context.selectedQuestion as Question,
					);
					break;
				}
				default:
					break;
			}
		});
		this.machine.start();
	}

	addAnswer(answer: Answer) {
		this.machine.send({ type: "playerSubmitsAnswer", answer });
	}
}

export { Round };
