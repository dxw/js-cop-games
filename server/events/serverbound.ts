import { Server, Socket } from "socket.io";
import { Colour, Player } from "../@types/models";
import { Lobby } from "../lobby";
import { Round } from "../round";
import { SocketServer } from "../socketServer";
import { clientboundEvents } from "./clientbound";

const serverboundEvents = {
	disconnect: (
		lobby: Lobby,
		socketId: Socket["id"],
		server: Server,
	): ServerboundSocketServerEvent<Events.Disconnect> => {
		return [
			Events.Disconnect,
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
	): ServerboundSocketServerEvent<Events.AnswersPost> {
		return [
			Events.AnswersPost,
			(data: { colours: Colour[] }) =>
				round?.addAnswer({ colours: data.colours, socketId }),
		];
	},
	postPlayers: (
		lobby: Lobby,
		socket: Socket,
		server: Server,
	): ServerboundSocketServerEvent<Events.PlayersPost> => {
		return [
			Events.PlayersPost,
			(data: { name: Player["name"] }) => {
				const player = lobby.addPlayer(data.name, socket.id);
				socket.emit(...clientboundEvents.setPlayer(player));
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	startRound: (
		server: SocketServer,
	): ServerboundSocketServerEvent<Events.RoundStart> => {
		return [
			Events.RoundStart,
			() => {
				server.onRoundStarted();
			},
		];
	},
};

export enum Events  {
 AnswersPost = "answers:post",
 Disconnect = "disconnect",
 PlayersPost = "players:post",
 RoundStart = "round:start"
}

type Payloads = {
	[Events.AnswersPost]: { colours: Colour[] };
	[Events.PlayersPost]: { name: Player["name"] };
};

type ServerboundSocketServerEvent<T extends Events> = T extends keyof Payloads
	? [Events, (data: Payloads[T]) => void]
	: [Events, () => void];

export { serverboundEvents };
