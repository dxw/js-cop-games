import type { Socket } from "socket.io-client";
import type { Answer } from "../../server/@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../../server/@types/events";

const addPlayer = (
	socket: Socket<ClientboundSocketServerEvents, ServerboundSocketServerEvents>,
	playerName: string,
): void => {
	socket.auth = { playerName };
	socket.connect();
	socket.emit("players:post", playerName);
};

const emitAnswersPost = (
	socket: Socket<ClientboundSocketServerEvents, ServerboundSocketServerEvents>,
	colours: Answer["colours"],
): void => {
	socket.emit("answers:post", colours);
};

export { addPlayer, emitAnswersPost };
