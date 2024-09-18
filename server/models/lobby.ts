import { type Actor, createActor } from "xstate";
import type { Player, Session } from "../@types/entities";
import { lobbyMachine } from "../machines/lobby";
import type { SocketServer } from "../socketServer";
import { machineLogger } from "../utils/loggingUtils";

class Lobby {
	machine: Actor<typeof lobbyMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(lobbyMachine, {
			inspect: machineLogger,
		});
		this.machine.subscribe((state) => {
			switch (state.value) {
				case "multiplePlayers": {
					this.emitShowStartButton();
					break;
				}
				default:
					break;
			}
		});
		this.machine.start();
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
}

export { Lobby };
