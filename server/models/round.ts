import { type Actor, type InspectionEvent, createActor } from "xstate";
import type { Answer, Player, Question } from "../@types/entities";
import { betweenTurnsCountdownMs, roundMachine } from "../machines/round";
import { turnMachine } from "../machines/turn";
import { turnEndCountdownMs } from "../machines/turn";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/loggingUtils";
import { getUpdatedPlayerScoresAndBonusPoints } from "../utils/scoringUtils";

class Round {
	machine: Actor<typeof roundMachine>;
	server: SocketServer;
	turnMachine: Actor<typeof turnMachine> | undefined;

	constructor(server: SocketServer, players: Player[]) {
		this.server = server;
		this.machine = createActor(
			roundMachine.provide({
				actions: {
					startBetweenTurnsCountdown: () =>
						this.server.startCountdown({
							durationMs: betweenTurnsCountdownMs,
							description: "Next turn starting in: ",
						}),
					stopBetweenTurnsCountdown: () => this.server.stopCountdown(),
				},
			}),
			{
				input: { players },
				inspect: machineLogger,
			},
		);
		this.machine.subscribe((state) => {
			const currentContext = this.machine.getSnapshot().context;

			switch (state.value) {
				case "turn": {
					// maybe we should rename this as it's not listening...
					this.server.onQuestionSet(
						currentContext.selectedQuestion as Question,
					);
					this.initialiseTurnMachine();
					break;
				}
				case "checkForWinner": {
					this.server.onScoresAndBonusPointsUpdated(
						currentContext.playerScores,
						currentContext.bonusPoints,
					);
					break;
				}
				case "roundEnd": {
					this.server.onScoresAndBonusPointsUpdated(
						currentContext.playerScores,
						currentContext.bonusPoints,
					);
					break;
				}
				default:
					break;
			}
		});
		const initialContext = this.machine.getSnapshot().context;

		this.server.onScoresAndBonusPointsUpdated(
			initialContext.playerScores,
			initialContext.bonusPoints,
		);
		this.machine.start();
	}

	initialiseTurnMachine() {
		this.turnMachine = createActor(
			turnMachine.provide({
				actions: {
					startTurnEndCountdown: () =>
						this.server.startCountdown({
							durationMs: turnEndCountdownMs,
							description: "Time remaining: ",
						}),
					stopTurnEndCountdown: () => this.server.stopCountdown(),
				},
			}),
			{
				inspect: (inspectionEvent: InspectionEvent) => {
					machineLogger(inspectionEvent);
				},
				input: {
					playerCount: this.machine.getSnapshot().context.playerScores.length,
					selectedQuestion: this.machine.getSnapshot().context
						.selectedQuestion as Question,
				},
			},
		);

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
