import { type Actor, type InspectionEvent, createActor } from "xstate";
import type { Answer, Player, Question } from "../@types/entities";
import { roundMachine } from "../machines/round";
import { turnMachine } from "../machines/turn";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/loggingUtils";
import { getUpdatedPlayerScoresAndBonusPoints } from "../utils/scoringUtils";

class Round {
	machine: Actor<typeof roundMachine>;
	turnMachine: Actor<typeof turnMachine> | undefined;

	constructor(
		{
			onQuestionSet,
			onScoresAndBonusPointsUpdated,
		}: {
			onQuestionSet: InstanceType<typeof SocketServer>["onQuestionSet"];
			onScoresAndBonusPointsUpdated: InstanceType<
				typeof SocketServer
			>["onScoresAndBonusPointsUpdated"];
		},
		players: Player[],
	) {
		this.machine = createActor(roundMachine, {
			input: { players },
			inspect: machineLogger,
		});
		this.machine.subscribe((state) => {
			const currentContext = this.machine.getSnapshot().context;
			onScoresAndBonusPointsUpdated(
				currentContext.playerScores,
				currentContext.bonusPoints,
			);

			switch (state.value) {
				case "turn": {
					// maybe we should rename this as it's not listening...
					onQuestionSet(currentContext.selectedQuestion as Question);
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
				playerCount: this.machine.getSnapshot().context.playerScores.length,
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
