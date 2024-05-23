import { type Actor, type InspectionEvent, createActor } from "xstate";
import type { Answer, Question } from "../@types/entities";
import { context, roundMachine } from "../machines/round";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/machineLogger";

class Round {
	machine: Actor<typeof roundMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(roundMachine, {
			...context,
			inspect: (inspectionEvent: InspectionEvent) => {
				machineLogger(inspectionEvent, 'round');
			},
		});
		this.machine.subscribe((state) => {
			console.info({
				machine: "round",
				context: state.context,
				state: state.value,
			});

			switch (state.value) {
				case "turn": {
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
