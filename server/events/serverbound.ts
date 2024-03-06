import type { Server, Socket } from "socket.io";
import { Colour, Player } from "../@types/models";
import type { Lobby } from "../lobby";
import { Round } from "../round";
import type { SocketServer } from "../socketServer";
import { clientboundEvents } from "./clientbound";

const serverboundEvents = {
	disconnect: (
		lobby: Lobby,
		socketId: Socket["id"],
		server: Server,
	): ServerboundSocketServerEvent<"disconnect"> => {
		return [
			"disconnect",
			() => {
				console.info(`disconnected: ${socketId}`);
				lobby.removePlayer(socketId);
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	postAnswers(
		socketId: Socket["id"],
		round?: Round,
	): ServerboundSocketServerEvent<"answers:post"> {
		return [
			"answers:post",
			(data: { colours: Colour[] }) =>
				round?.addAnswer({ colours: data.colours, socketId }),
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

type Payloads = {
	"answers:post": { colours: Colour[] };
	"players:post": { name: Player["name"] };
};

type ServerboundSocketServerEvent<T extends Event> = T extends keyof Payloads
	? [Event, (data: Payloads[T]) => void]
	: [Event, () => void];

export { serverboundEvents };
