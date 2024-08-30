import { type Actor, createActor } from "xstate";
import type { Player, Session } from "../@types/entities";
import { lobbyMachine } from "../machines/lobby";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/loggingUtils";

export type TopLevelState = "lobbyMachine" | "roundMachine";

class Lobby {
	machine: Actor<typeof lobbyMachine>;
	server: SocketServer;
	topLevelState: TopLevelState = "lobbyMachine";

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(lobbyMachine, {
			inspect: machineLogger,
		});

		this.machine.subscribe((state) => {
			this.emitStateChange();
			switch (state.value) {
				case "multiplePlayers": {
					this.emitShowStartButton();
					break;
				}
				case "round": {
					this.topLevelState = "roundMachine";
					break;
				}
				default:
					break;
			}
		});
		this.machine.start();

		this.machine.on("roundMachineInvoked", () => {
			this.topLevelState = "roundMachine";
		});
	}

	emitStateChange() {
		this.server.emitStateChange({
			state: `${this.topLevelState}:${this.machine.getSnapshot().value}`,
			context: this.machine.getSnapshot().context,
		});
	}

	get players(): Player[] {
		return this.machine.getSnapshot().context.players;
	}

	addPlayer = (name: Player["name"], sessionId: Session["id"]) => {
		const player = { name, sessionId };
		this.machine.send({ player, type: "playerJoins" });
		return this.findPlayer(player);
	};

	emitShowStartButton = (): void => {
		this.server.onShowStartButton();
	};

	findPlayer = (player: Player): Player => {
		const desiredPlayer = this.machine
			.getSnapshot()
			.context.players.find((p) => p.sessionId === player.sessionId);

		if (!desiredPlayer) {
			throw new Error("Player not found in context");
		}

		return desiredPlayer;
	};

	playerNames = (): Player["name"][] => {
		return this.machine
			.getSnapshot()
			.context.players.map((player) => player.name)
			.reverse();
	};

	removePlayer = (sessionId: Session["id"]): void => {
		this.machine.send({ sessionId, type: "playerLeaves" });
	};

	startRound = () => {
		this.machine.send({ type: "playerClicksStart" });
	};
}

export { Lobby };
