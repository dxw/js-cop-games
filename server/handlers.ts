import type { Player, Session } from "./@types/entities";
import type { Lobby } from "./models/lobby";
import type { SocketT, WebSocketServer } from "./socketServer";

export const addPlayerHandler = (
	server: WebSocketServer,
	socket: SocketT,
	lobby: Lobby,
	name: Player["name"],
	sessionId: Session["id"],
) => {
	const player = lobby.addPlayer(name, sessionId);
	socket.emit("player:set", player);
	server.emit("players:get", lobby.playerNames());
};
