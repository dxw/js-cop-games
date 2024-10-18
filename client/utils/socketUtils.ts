import type { Socket } from "socket.io-client";
import type { Answer } from "../../server/@types/entities.d.ts";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../../server/@types/events.d.ts";

const addPlayer = (
	socket: Socket<ClientboundSocketServerEvents, ServerboundSocketServerEvents>,
	name: string,
): void => {
	socket.emit("players:post", name);
};

const emitAnswersPost = (
	socket: Socket<ClientboundSocketServerEvents, ServerboundSocketServerEvents>,
	colours: Answer["colours"],
): void => {
	socket.emit("answers:post", colours);
};

export { addPlayer, emitAnswersPost };
