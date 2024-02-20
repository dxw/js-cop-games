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
		socket: Socket,
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

interface Payload {
	colours: Colour[];
	name: Player["name"];
}

type ServerboundSocketServerEvent<T extends Event> = T extends
	| "disconnect"
	| "round:start"
	? [Event, () => void]
	: [Event, (data: Payload) => void];

export { serverboundEvents };
