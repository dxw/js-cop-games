import type { Server, Socket } from "socket.io";

import { Colour, Player } from "../@types/models";
import type { Lobby } from "../lobby";
import { Round } from "../round";
import type { SocketServer } from "../socketServer";
import { clientboundEvents } from "./clientbound";

const serverboundEvents = {
	disconnect: (
		lobby: Lobby,
		socket: Socket,
		server: Server,
	): ServerboundSocketServerEvent => {
		return [
			"disconnect",
			() => {
				console.info(`disconnected: ${socket.id}`);
				lobby.removePlayer(socket.id);
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	postAnswers(
		socket: Socket,
		round?: Round,
	): ServerboundSocketServerEvent<"colours"> {
		return [
			"answers:post",
			(data: { colours: Colour[] }) =>
				round?.addAnswer({ colours: data.colours, socketId: socket.id }),
		];
	},
	postPlayers: (
		lobby: Lobby,
		socket: Socket,
		server: Server,
	): ServerboundSocketServerEvent<"name"> => {
		return [
			"players:post",
			(data: { name: Player["name"] }) => {
				const player = lobby.addPlayer(data.name, socket.id);
				socket.emit(...clientboundEvents.setPlayer(player));
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	// this one needs to use the new type format
	startRound: (server: SocketServer): ["round:start", () => void] => {
		return [
			"round:start",
			() => {
				server.onRoundStarted();
			},
		];
	},
};

type Event = "answers:post" | "disconnect" | "players:post" | "round:start";

type Payload = keyof Payloads;

interface Payloads {
	colours: Colour[];
	name: Player["name"];
	socketId: Socket["id"];
}

// Biome error - we could possibly ignore it
type ServerboundSocketServerEvent<T extends Payload | void = void> =
	T extends void
		? ["disconnect", () => void]
		: // data: Payloads doesn't seem right - maybe Payloads[T] (but that doesn't work)?
		  [Event, (data: Payloads) => void];

export { serverboundEvents };
