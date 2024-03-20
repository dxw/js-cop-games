import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type {
	Answer,
	Colour,
	Player,
	Question,
} from "../server/@types/entities";
import type {
	ClientboundSocketServerEvents,
	ServerboundSocketServerEvents,
} from "../server/@types/events";
import type { NameFormElement } from "../server/@types/ui";
import { getElementById } from "./utils/getElementById";

const addPlayer = async (name: string): Promise<void> => {
	socket.emit("players:post", name);
};

const generateSocketUrl = (): string => {
	const location = window.location;

	return `//${location.host}${location.pathname}`;
};

const renderPlayerList = (): void => {
	const html = playerNames.map((name) => `<li>${name}</li>`);
	playerListElement.innerHTML = html.join("\n");
};

const renderPlayerName = (): void => {
	const text = `Name: ${currentPlayer.name}`;
	playerNameElement.innerText = text;
};

// biome-ignore lint/style/useNamingConvention: the issue here is the consecutive upper case characters, but given it's due to using a single-character word, this doesn't feel invalid
const askAQuestion = (data: Question): void => {
	const { question, number } = data;
	const questionHtml = getElementById("question");
	questionHtml.innerText = question;
	const numberHtml = getElementById("number");
	numberHtml.innerText = number.toString();
};

const renderColourCheckboxes = (): void => {
	const colourSection = getElementById("colour-section");
	const template = getElementById<HTMLTemplateElement>("checkbox-template");
	const clone = template.content.cloneNode(true) as DocumentFragment;
	colourSection.appendChild(clone);

	const colourForm = getElementById<HTMLFormElement>("checkbox-form");
	colourForm.addEventListener("submit", (e) => {
		e.preventDefault();
		submitAnswers(colourForm);
	});
};

const derenderNameForm = (): void => {
	getElementById("name-form").remove();
};

const startButton = getElementById("start-button");

const showStartButton = (): void => {
	startButton.style.display = "block";
};

startButton.addEventListener("click", () => {
	socket.emit("round:start");
});

const derenderStartButton = (): void => {
	startButton.remove();
};

const submitAnswers = async (form: HTMLFormElement): Promise<void> => {
	const checked = form.querySelectorAll('input[type="checkbox"]:checked');
	const colours: Answer["colours"] = Array.from(checked).map(
		(checked) => checked.id as Colour,
	);
	socket.emit("answers:post", colours);
	derenderColorCheckboxes();
	getElementById("colour-section").innerText = `You picked: ${colours.join(
		", ",
	)}`;
};

const derenderColorCheckboxes = (): void => {
	getElementById("checkbox-form").remove();
};

const connectionStatusIconElement = getElementById("connection-status-icon");
const nameFormElement = getElementById("name-form") as NameFormElement;
const playerListElement = getElementById("player-list");
const playerNameElement = getElementById("player-name");

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
	renderPlayerList();
});

socket.on("player:set", (player) => {
	currentPlayer = player;
	renderPlayerName();
	derenderNameForm();
});

socket.on("question:get", (question) => {
	derenderStartButton();
	askAQuestion(question);
	renderColourCheckboxes();
});

socket.on("round:startable", () => {
	showStartButton();
});

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(nameFormElement.elements.name.value);
	nameFormElement.elements.name.value = "";
});
