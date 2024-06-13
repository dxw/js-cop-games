import { type Socket, io } from "socket.io-client";
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

const addPlayer = (name: string): void => {
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
const roundResetButton = getElementById("round-reset-button");

const showStartButton = (): void => {
	startButton.style.display = "block";
};

const showRoundResetButton = (): void => {
	roundResetButton.style.display = "block";
};

startButton.addEventListener("click", () => {
	socket.emit("round:start");
});

roundResetButton.addEventListener("click", () => {
	socket.emit("round:reset");
});

const hideStartButton = (): void => {
	startButton.style.display = "none";
};

const hideRoundResetButton = (): void => {
	roundResetButton.style.display = "none";
};

const submitAnswers = async (form: HTMLFormElement): Promise<void> => {
	const checked = form.querySelectorAll('input[type="checkbox"]:checked');
	const colours: Answer["colours"] = Array.from(checked).map(
		(checked) => checked.id as Colour,
	);
	socket.emit("answers:post", colours);
	derenderColorCheckboxes();
	const answeredColourCards = colours.map(
		(colour) =>
			`<div class="colour-cards__card colour-cards__card--${colour}">
				<p>${colour[0].toUpperCase()}${colour.slice(1)}</p>
			</div>`,
	);
	getElementById("colour-section").innerHTML = `
		<h2>Your selection</h2>
		<div class="colour-cards">
			${answeredColourCards.join("")}
		</div>
	`;
};

const derenderColorCheckboxes = (): void => {
	getElementById("checkbox-form").remove();
};

const showUnjoinableMessage = (): void => {
	const nameForm = document.querySelector("#name-form");
	const unjoinableMessage = document.createElement("p");
	unjoinableMessage.innerText = "Round in progress. Try again later";
	nameForm?.replaceWith(unjoinableMessage);
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
	askAQuestion(question);
	renderColourCheckboxes();
});

socket.on("round:startable", () => {
	showStartButton();
});

socket.on("round:start", () => {
	hideStartButton();
	showRoundResetButton();
});

socket.on("lobby:unjoinable", () => {
	showUnjoinableMessage();
});

socket.on("round:reset", () => {
	getElementById("question").innerText = "";
	getElementById("number").innerText = "";
	getElementById("colour-section").innerHTML = "";
	hideRoundResetButton();

	if (playerNames.length > 1) {
		showStartButton();
	}
});

nameFormElement.addEventListener("submit", (e) => {
	e.preventDefault();
	addPlayer(nameFormElement.elements.name.value);
	nameFormElement.elements.name.value = "";
});
