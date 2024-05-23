import { type Actor, type InspectionEvent, createActor } from "xstate";
import type { Answer, Question } from "../@types/entities";
import { context, roundMachine } from "../machines/round";
import { turnMachine } from "../machines/turn";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/machineLogger";

class Round {
	machine: Actor<typeof roundMachine>;
	turnMachine?: Actor<typeof turnMachine>;
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

					this.initialiseTurnMachine()
					break;
				}
				default:
					break;
			}
		});
		this.machine.start();

	}

	initialiseTurnMachine() {
		this.turnMachine = createActor(turnMachine, {
			inspect: (inspectionEvent: InspectionEvent) => {
				machineLogger(inspectionEvent, "turn");
			},
		});
		this.turnMachine.subscribe((state) => {
		// if state.value === "finished"
		// pass answer back to round and kill this instance of the turn machine
		})
		this.turnMachine.start();
	}

	addAnswer(answer: Answer) {

		this.turnMachine?.send({ type: "playerSubmitsAnswer", answer})
	}
}

export { Round };
