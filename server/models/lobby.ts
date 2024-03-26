import type { Socket } from "socket.io";
import { type Actor, createActor } from "xstate";
import type { Player } from "../@types/entities";
import { context, lobbyMachine } from "../machines/lobby";
import type { SocketServer } from "../socketServer";

class Lobby {
	machine: Actor<typeof lobbyMachine>;
	server: SocketServer;

	constructor(server: SocketServer) {
		this.server = server;
		this.machine = createActor(lobbyMachine, { ...context });
		this.machine.subscribe((state) => {
			console.info({
				machine: "lobby",
				context: state.context,
				state: state.value,
			});

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

	addPlayer = (name: Player["name"], socketId: Socket["id"]) => {
		const player = { name, socketId };
		this.machine.send({ player, type: "playerJoins" });
		return this.findPlayer(player);
	};

	emitShowStartButton = (): void => {
		this.server.onShowStartButton();
	};

	findPlayer = (player: Player): Player => {
		const desiredPlayer = this.machine
			.getSnapshot()
			.context.players.find((p) => p.socketId === player.socketId);

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

	removePlayer = (socketId: Socket["id"]): void => {
		this.machine.send({ socketId, type: "playerLeaves" });
	};
}

export { Lobby };
