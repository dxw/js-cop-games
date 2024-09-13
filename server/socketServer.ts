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
	sessionStore: SessionStore = new SessionStore();

	constructor(httpServer: HttpServer) {
		this.lobby = new Lobby(this);
		this.server = new Server(httpServer, {});

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
						session.playerName,
						session.id,
					);
					return next();
				}
			}
			const playerName = socket.handshake.auth.playerName;
			if (!playerName) {
				return next(new Error("invalid playerName"));
			}

			socket.data.session = {
				id: crypto.randomUUID(),
				playerName: playerName,
			};
			next();
		});

		this.server.on("connection", (socket) => {
			logWithTime(
				"User connected",
				[`Name: ${socket.data.playerName}`, `ID: ${socket.data.userId}`].join(
					"\n",
				),
			);

			if (this.round) {
				socket.emit("lobby:unjoinable");
			}

			socket.emit("players:get", this.lobby.playerNames());
			socket.on("players:post", (name: Player["name"]) => {
				addPlayerHandler(this.server, socket, this.lobby, name, session.id);
			});

			socket.on("disconnect", () => {
				logWithTime(
					"User disconnected",
					[
						`Name: ${socket.data.session.playerName}`,
						`ID: ${socket.data.session.id}`,
					].join("\n"),
				);

				this.sessionStore.saveSession(session);

				this.lobby.removePlayer(session.id);

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
