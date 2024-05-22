import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Colour, Player, Question } from "./@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "./@types/events";
import { Lobby } from "./models/lobby";
import { Round } from "./models/round";

export class SocketServer {
	lobby: Lobby;
	round?: Round;
	server: Server<ServerboundSocketServerEvents, ClientboundSocketServerEvents>;

	constructor(httpServer: HttpServer) {
		this.lobby = new Lobby(this);
		this.server = new Server(httpServer, {});

		this.onCreated();
	}

	onCreated() {
		this.server.on("connection", (socket) => {
			console.info(`connected: ${socket.id}`);

			if (this.round) {
				socket.emit("lobby:unjoinable");
			}

			socket.emit("players:get", this.lobby.playerNames());
			socket.on("players:post", (name: Player["name"]) => {
				const player = this.lobby.addPlayer(name, socket.id);
				socket.emit("player:set", player);
				this.server.emit("players:get", this.lobby.playerNames());
			});
			socket.on("disconnect", () => {
				console.info(`disconnected: ${socket.id}`);
				this.lobby.removePlayer(socket.id);
				this.server.emit("players:get", this.lobby.playerNames());
			});
			socket.on("round:start", () => {
				this.onRoundStarted();
			});
			socket.on("round:reset", () => {
				this.onRoundReset();
			});
			socket.on("answers:post", (colours: Colour[]) =>
				this.round?.addAnswer({ colours: colours, socketId: socket.id }),
			);
		});
	}

	onQuestionSet(question: Question) {
		this.server.emit("question:get", question);
	}

	onRoundStarted() {
		this.round ||= new Round(this);
		this.server.emit("round:start");
	}

	onRoundReset() {
		this.round = undefined;
		this.server.emit("round:reset");
	}

	onShowStartButton() {
		this.server.emit("round:startable");
	}
}
