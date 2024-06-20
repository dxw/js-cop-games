import { type Socket, io } from "socket.io-client";
import type { Answer, Player } from "../server/@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../server/@types/events";
import type { NameFormElement } from "../server/@types/ui";
import {
	askAQuestion,
	derenderPlayerNameForm,
	derenderRoundResetButton,
	derenderStartButton,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderRoundResetButton,
	renderStartButton,
	renderUnjoinableMessage,
} from "./utils/domManipulationUtils";
import { getElementById } from "./utils/getElementById";

const connectionStatusIconElement = getElementById<HTMLDivElement>(
	"connection-status-icon",
);
const nameFormElement = getElementById<NameFormElement>("name-form");
const roundResetButtonElement =
	getElementById<HTMLButtonElement>("round-reset-button");
const startButtonElement = getElementById<HTMLButtonElement>("start-button");

const addPlayer = (name: string): void => {
	socket.emit("players:post", name);
};

const generateSocketUrl = (): string => {
	const location = window.location;

	return `//${location.host}${location.pathname}`;
};

const emitAnswersPost = (colours: Answer["colours"]): void => {
	socket.emit("answers:post", colours);
};

startButtonElement.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButtonElement.addEventListener("click", () => {
	socket.emit("round:reset");
});

let currentPlayer: Player; // TODO: account for this being undefined?
let playerNames: Player["name"][] = [];

const socket: Socket<
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents
> = io(generateSocketUrl());

socket.on("connect", () => {
	connectionStatusIconElement.innerText = "Connected 🟢";
});

socket.on("disconnect", () => {
	connectionStatusIconElement.innerText = "Disconnected 🔴";
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
	askAQuestion(question);
	renderColourCheckboxes(emitAnswersPost);
});

socket.on("round:startable", () => {
	renderStartButton();
});

socket.on("round:start", () => {
	derenderStartButton();
	renderRoundResetButton();
});

socket.on("lobby:unjoinable", () => {
	renderUnjoinableMessage();
});

socket.on("round:reset", () => {
	getElementById("question").style.display = "none";
	getElementById("thing").innerText = "";
	getElementById("number").innerText = "";
	getElementById("colour-section").innerHTML = "";
	derenderRoundResetButton();

	if (playerNames.length > 1) {
		renderStartButton();
	}
});

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(nameFormElement.elements.name.value);
	nameFormElement.elements.name.value = "";
});
