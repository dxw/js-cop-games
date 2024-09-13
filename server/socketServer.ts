import crypto from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { CountdownOptions } from "../client/utils/domManipulationUtils/countdown";
import type {
	Colour,
	Player,
	PlayerScore,
	Question,
	Session,
} from "./@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "./@types/events";
import { addPlayerHandler } from "./handlers";
import { Lobby } from "./models/lobby";
import { Round } from "./models/round";
import { SessionStore } from "./sessionStore";
import { logWithTime } from "./utils/loggingUtils";

const randomId = () => crypto.randomBytes(8).toString("hex");

export type WebSocketServer = Server<
	ServerboundSocketServerEvents,
	ClientboundSocketServerEvents,
	never,
	{
		session: Session;
	}
>;

export type SocketT = Socket<
	ServerboundSocketServerEvents,
	ClientboundSocketServerEvents,
	never,
	{ session: Session }
>;
export class SocketServer {
	lobby: Lobby;
	round?: Round;
	server: WebSocketServer;
	sessionStore: SessionStore;

	constructor(httpServer: HttpServer) {
		this.lobby = new Lobby(this);
		this.server = new Server(httpServer, {});
		this.sessionStore = new SessionStore();

		this.onCreated();
	}

	onCreated() {
		this.server.use((socket, next) => {
			const sessionId = socket.handshake.auth.sessionId;
			if (sessionId) {
				// find existing session
				const session = this.sessionStore.findSession(sessionId);
				if (session) {
					socket.data.session = session;

					addPlayerHandler(
						this.server,
						socket,
						this.lobby,
						session.username,
						session.id,
					);
					return next();
				}
			}
			const username = socket.handshake.auth.username;
			if (!username) {
				return next(new Error("invalid username"));
			}

			socket.data.sessionId = randomId();
			socket.data.userId = randomId();
			socket.data.username = username;
			next();
		});

		this.server.on("connection", (socket) => {
			logWithTime(`Socket connected: ${socket.handshake.auth.username}`);

			if (this.round) {
				socket.emit("lobby:unjoinable");
			}

			socket.emit("players:get", this.lobby.playerNames());
			socket.on("players:post", (name: Player["name"]) => {
				addPlayerHandler(this.server, socket, this.lobby, name, session.id);
			});

			socket.on("disconnect", () => {
				this.sessionStore.saveSession(session);
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
