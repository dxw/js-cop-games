import { type Socket, io } from "socket.io-client";
import type { Answer, Player } from "../server/@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../server/@types/events";
import type { NameFormElement } from "../server/@types/ui";
import {
	askAQuestion,
	populateElements,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderStartButton,
	renderUnjoinableMessage,
	resetPlayerNameFormValue,
	resetRound,
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

const elementNames = [
	"question",
	"thing",
	"number",
	"checkbox-id",
	"checkbox-form",
	"player-list",
	"name-form",
	"player-name",
	"round-reset-button",
	"start-button",
	"connection-status-icon",
] as const;

export type ElementNames = typeof elementNames;

export let elements: { [ElementName in ElementNames[number]]: HTMLElement };

document.addEventListener("DOMContentLoaded", () => {
	populateElements(elementNames);
});

socket.on("connect", () => {
	elements["connection-status-icon"].innerText = "Connected 🟢";
});

socket.on("disconnect", () => {
	elements["connection-status-icon"].innerText = "Disconnected 🔴";
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
	elements["name-form"].style.display = "none";
});

socket.on("question:get", (question) => {
	askAQuestion(question);
	renderColourCheckboxes((colours: Answer["colours"]) =>
		emitAnswersPost(socket, colours),
	);
});

socket.on("round:reset", () => {
	resetRound(playerNames);
});

socket.on("round:start", () => {
	elements["start-button"].style.display = "none";
	elements["round-reset-button"].style.display = "block";
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
	resetPlayerNameFormValue();
});

startButtonElement.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButtonElement.addEventListener("click", () => {
	socket.emit("round:reset");
});
