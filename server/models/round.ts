import { type Actor, type InspectionEvent, createActor } from "xstate";
import type { Answer, Question } from "../@types/entities";
import { context, roundMachine } from "../machines/round";
import { turnMachine } from "../machines/turn";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/loggingUtils";
import { getUpdatedPlayerScoresAndBonusPoints } from "../utils/scoringUtils";

class Round {
	machine: Actor<typeof roundMachine>;
	server: SocketServer;
	turnMachine: Actor<typeof turnMachine> | undefined;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(roundMachine, {
			...context,
			inspect: machineLogger,
		});
		this.machine.subscribe((state) => {
			switch (state.value) {
				case "turn": {
					// maybe we should rename this as it's not listening...
					this.server.onQuestionSet(
						this.machine.getSnapshot().context.selectedQuestion as Question,
					);
					this.initialiseTurnMachine();
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
				machineLogger(inspectionEvent);
			},
			input: {
				selectedQuestion: this.machine.getSnapshot().context
					.selectedQuestion as Question,
			},
		});

		this.turnMachine.subscribe({
			complete: () => {
				const roundMachineSnapshot = this.machine.getSnapshot();
				this.machine.send({
					type: "turnEnd",
					scoresAndBonusPoints: getUpdatedPlayerScoresAndBonusPoints(
						roundMachineSnapshot.context.bonusPoints,
						roundMachineSnapshot.context.playerScores,
						this.turnMachine?.getSnapshot()?.output?.correctPlayerSocketIds ||
							[],
					),
				});
			},
		});
		this.turnMachine.start();
	}

	addAnswer(answer: Answer) {
		this.turnMachine?.send({ type: "playerSubmitsAnswer", answer });
	}
}

export { Round };
