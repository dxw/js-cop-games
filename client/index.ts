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
	derenderStartButton,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderRoundResetButton,
	renderStartButton,
} from "./utils/domManipulationUtils";
import { getElementById } from "./utils/getElementById";

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

const startButton = getElementById("start-button");
const roundResetButton = getElementById("round-reset-button");

startButton.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButton.addEventListener("click", () => {
	socket.emit("round:reset");
});

const hideRoundResetButton = (): void => {
	roundResetButton.style.display = "none";
};

const showUnjoinableMessage = (): void => {
	const nameForm = document.querySelector("#name-form");
	const unjoinableMessage = document.createElement("p");
	unjoinableMessage.innerText = "Round in progress. Try again later";
	nameForm?.replaceWith(unjoinableMessage);
};

const connectionStatusIconElement = getElementById("connection-status-icon");
const nameFormElement = getElementById("name-form") as NameFormElement;

let currentPlayer: Player;
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
	showUnjoinableMessage();
});

socket.on("round:reset", () => {
	getElementById("question").style.display = "none";
	getElementById("thing").innerText = "";
	getElementById("number").innerText = "";
	getElementById("colour-section").innerHTML = "";
	hideRoundResetButton();

	if (playerNames.length > 1) {
		renderStartButton();
	}
});

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(nameFormElement.elements.name.value);
	nameFormElement.elements.name.value = "";
});
