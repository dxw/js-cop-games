import type { Server, Socket } from "socket.io";

import type { Lobby } from "../lobby";
import type { SocketServer } from "../socketServer";
import { clientboundEvents } from "./clientbound";

const serverboundEvents = {
	disconnect: (
		lobby: Lobby,
		socket: Socket,
		server: Server,
	): [string, () => void] => {
		return [
			"disconnect",
			() => {
				console.info(`disconnected: ${socket.id}`);
				lobby.removePlayer(socket.id);
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	postPlayers: (
		lobby: Lobby,
		socket: Socket,
		server: Server,
	): [string, (data: { name: string }) => void] => {
		return [
			"players:post",
			(data: { name: string }) => {
				const player = lobby.addPlayer(data.name, socket.id);
				socket.emit(...clientboundEvents.setPlayer(player));
				server.emit(...clientboundEvents.getPlayers(lobby));
			},
		];
	},
	startRound: (server: SocketServer): [string, () => void] => {
		return [
			"round:start",
			() => {
				server.onRoundStarted();
			},
		];
	},
};

export { serverboundEvents };
