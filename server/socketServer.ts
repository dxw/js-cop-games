import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { Question } from "./@types/models";
import { clientboundEvents } from "./events/clientbound";
import { serverboundEvents } from "./events/serverbound";
import { Lobby } from "./lobby";
import { Round } from "./round";

export class SocketServer {
	lobby: Lobby;
	round?: Round;
	server: Server;

	constructor(httpServer: HttpServer) {
		this.lobby = new Lobby(this);
		this.server = new Server(httpServer, {});

		this.onCreated();
	}

	onCreated() {
		this.server.on("connection", (socket) => {
			console.info(`connected: ${socket.id}`);

			socket.emit(...clientboundEvents.getPlayers(this.lobby));
			socket.on(
				...serverboundEvents.postPlayers(this.lobby, socket, this.server),
			);
			socket.on(
				...serverboundEvents.disconnect(this.lobby, socket.id, this.server),
			);
			socket.on(...serverboundEvents.startRound(this));
			socket.on(...serverboundEvents.postAnswers(socket.id, this.round));
		});
	}

	onQuestionSet(question: Question) {
		this.server.emit(...clientboundEvents.getQuestion(question));
	}

	onRoundStarted() {
		this.round = new Round(this);
	}

	onShowStartButton() {
		this.server.emit(clientboundEvents.showStartButton());
	}
}
