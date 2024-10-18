import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { CountdownOptions } from "../client/utils/domManipulationUtils/countdown.ts";
import type {
	Colour,
	Player,
	PlayerScore,
	Question,
} from "./@types/entities.d.ts";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "./@types/events.d.ts";
import { Lobby } from "./models/lobby.ts";
import { Round } from "./models/round.ts";
import { logWithTime } from "./utils/loggingUtils.ts";

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
			logWithTime(`Socket connected: ${socket.id}`);

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
				logWithTime(`Socket disconnected: ${socket.id}`);
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
		// Should we pass something other than `this` as the first arg to Round?
		this.round ||= new Round(this, this.lobby.players);
		this.server.emit("round:start");
	}

	onRoundReset() {
		this.round = undefined;
		this.server.emit("round:reset");
	}

	onScoresAndBonusPointsUpdated(
		playersScores: PlayerScore[],
		bonusPoints: number,
	) {
		this.server.emit("scoresAndBonusPoints:get", playersScores, bonusPoints);
	}

	onShowStartButton() {
		this.server.emit("round:startable");
	}

	startCountdown = (countdownOptions: CountdownOptions) => {
		this.server.emit("countdown:start", countdownOptions);
	};

	stopCountdown = () => {
		this.server.emit("countdown:stop");
	};
}
