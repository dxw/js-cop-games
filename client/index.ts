import { type Socket, io } from "socket.io-client";
import type { Answer, Player } from "../server/@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../server/@types/events";
import { addAdminModeListener } from "./utils/adminUtils";
import type { NameFormElement } from "./utils/domManipulationUtils";
import { renderBonusPoints } from "./utils/domManipulationUtils/bonusPoints";
import { renderColourCheckboxes } from "./utils/domManipulationUtils/colourCheckboxes";
import {
	renderConnectedIndicator,
	renderDisconnectedIndicator,
} from "./utils/domManipulationUtils/connectionStatus";
import {
	type CountdownOptions,
	derenderCountdown,
	renderCountdown,
} from "./utils/domManipulationUtils/countdown";
import {
	renderPlayerList,
	renderPlayerListWithScores,
} from "./utils/domManipulationUtils/playerList";
import {
	derenderPlayerNameForm,
	renderPlayerName,
	resetPlayerNameFormValue,
} from "./utils/domManipulationUtils/playerName";
import { renderQuestion } from "./utils/domManipulationUtils/question";
import { resetRound } from "./utils/domManipulationUtils/roundReset";
import {
	derenderStartButton,
	renderStartButton,
} from "./utils/domManipulationUtils/startButton";
import { renderUnjoinableMessage } from "./utils/domManipulationUtils/unjoinableMessage";
import { getElementById } from "./utils/getElementById";
import { addPlayer, emitAnswersPost } from "./utils/socketUtils";

const generateSocketUrl = (): string => {
	const location = window.location;

	return `//${location.host}${location.pathname}`;
};

const socket: Socket<
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents
> = io(generateSocketUrl());

let currentPlayer: Player; // TODO: account for this being undefined?
let playerNames: Player["name"][] = [];

socket.on("connect", () => {
	renderConnectedIndicator();
});

socket.on("countdown:start", (countdownOptions: CountdownOptions) => {
	renderCountdown(countdownOptions);
});

socket.on("countdown:stop", () => {
	derenderCountdown();
});

socket.on("disconnect", () => {
	renderDisconnectedIndicator();
});

socket.on("lobby:unjoinable", () => {
	renderUnjoinableMessage();
});

socket.on("players:get", (newPlayers) => {
	playerNames = newPlayers;
	renderPlayerList(playerNames);
});

socket.on("player:set", (player) => {
	currentPlayer = player;
	renderPlayerName(currentPlayer);
	derenderPlayerNameForm();
});

socket.on("question:get", (question) => {
	renderQuestion(question);
	renderColourCheckboxes((colours: Answer["colours"]) =>
		emitAnswersPost(socket, colours),
	);
});

socket.on("round:reset", () => {
	resetRound(playerNames);
});

socket.on("round:start", () => {
	derenderStartButton();
	addAdminModeListener();
});

socket.on("round:startable", () => {
	renderStartButton();
});

socket.on("scoresAndBonusPoints:get", (playerScores, bonusPoints) => {
	renderPlayerListWithScores(playerScores);
	renderBonusPoints(bonusPoints);
});

const nameFormElement = getElementById<NameFormElement>("name-form");

const roundResetButtonElement =
	getElementById<HTMLButtonElement>("round-reset-button");

const startButtonElement = getElementById<HTMLButtonElement>("start-button");

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(socket, nameFormElement.elements.name.value);
	resetPlayerNameFormValue();
});

startButtonElement.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButtonElement.addEventListener("click", () => {
	socket.emit("round:reset");
});
