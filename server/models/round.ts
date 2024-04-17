import { type Actor, createActor } from "xstate";
import type { Answer, Question } from "../@types/entities";
import { context, roundMachine } from "../machines/round";
import type { SocketServer } from "../socketServer";

class Round {
	machine: Actor<typeof roundMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(roundMachine, { ...context });
		this.machine.subscribe((state) => {
			console.info({
				machine: "round",
				context: state.context,
				state: state.value,
				timerValue: state.children.timer?.getSnapshot().context.elapsed,
			});

			switch (state.value) {
				case "roundStart": {
					this.server.onQuestionSet(
						this.machine.getSnapshot().context.selectedQuestion as Question,
					);
					break;
				}
				case "countdown": {
					this.server.onCountdown()
					break;
				}
				default:
					break;
			}

			if (state.children.timer) {
				state.children.timer.subscribe(_ => {
					console.info({
						timerValue: state.children.timer?.getSnapshot().context.elapsed
					})
				})
			}
		});
		this.machine.start();
	}

	addAnswer(answer: Answer) {
		this.machine.send({ type: "playerSubmitsAnswer", answer });
	}
}

export { Round };
