import type { Server, Socket } from "socket.io";

import { Colour, Player } from "../@types/models";
import type { Lobby } from "../models/lobby";
import type { Round } from "../models/round";
import type { SocketServer } from "../socketServer";
import { clientboundEvents } from "./clientbound";

const serverboundEvents = {
	disconnect: (
		lobby: Lobby,
		socket: Socket, // this can just be the ID
		server: Server,
	): ServerboundSocketServerEvent<"disconnect"> => {
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
		socket: Socket, // this can just be the ID
		round?: Round,
	): ServerboundSocketServerEvent<"answers:post"> {
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
	): ServerboundSocketServerEvent<"players:post"> => {
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
	startRound: (
		server: SocketServer,
	): ServerboundSocketServerEvent<"round:start"> => {
		return [
			"round:start",
			() => {
				server.onRoundStarted();
			},
		];
	},
};

type Event = "answers:post" | "disconnect" | "players:post" | "round:start";

// type Payload = keyof Payloads;

interface Payloads {
	colours: Colour[];
	name: Player["name"];
	socketId: Socket["id"];
}

type ServerboundSocketServerEvent<T extends Event> = T extends
	| "disconnect"
	| "round:start"
	? [Event, () => void]
	: // data: Payloads doesn't seem right - maybe Payloads[T] (but that doesn't work)?
	  [Event, (data: Payloads) => void];

// // Biome error - we could possibly ignore it
// type ServerboundSocketServerEvent<T extends Payload> =
// 	T extends void
// 		? ["disconnect" | "round:start", () => void]
// 		: // data: Payloads doesn't seem right - maybe Payloads[T] (but that doesn't work)?
// 		  [Event, (data: Payloads) => void];

export { serverboundEvents };
