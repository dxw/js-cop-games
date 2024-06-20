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
	indicateConnected,
	indicateDisconnected,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderRoundResetButton,
	renderStartButton,
	renderUnjoinableMessage,
} from "./utils/domManipulationUtils";
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
	indicateConnected();
});

socket.on("disconnect", () => {
	indicateDisconnected();
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
	askAQuestion(question);
	renderColourCheckboxes((colours: Answer["colours"]) =>
		emitAnswersPost(socket, colours),
	);
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

socket.on("round:start", () => {
	derenderStartButton();
	renderRoundResetButton();
});

socket.on("round:startable", () => {
	renderStartButton();
});

const nameFormElement = getElementById<NameFormElement>("name-form");

const roundResetButtonElement =
	getElementById<HTMLButtonElement>("round-reset-button");

const startButtonElement = getElementById<HTMLButtonElement>("start-button");

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(socket, nameFormElement.elements.name.value);
	nameFormElement.elements.name.value = "";
});

startButtonElement.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButtonElement.addEventListener("click", () => {
	socket.emit("round:reset");
});
