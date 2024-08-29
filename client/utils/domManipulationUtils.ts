import type {
	Answer,
	Colour,
	Player,
	PlayerScore,
	Question,
} from "../../server/@types/entities";
import type { NameFormElement } from "../../server/@types/ui";
import { getElementById } from "./getElementById";

let bonusPointsElement: HTMLParagraphElement | undefined;
let checkboxFormElement: HTMLFormElement | undefined;
let checkboxTemplateElement: HTMLTemplateElement | undefined;
let colourSectionElement: HTMLElement | undefined;
let connectionStatusIconElement: HTMLDivElement | undefined;
let countdownTimerElement: HTMLElement | undefined;
let questionElement: HTMLElement | undefined;
let questionNumberElement: HTMLElement | undefined;
let questionThingElement: HTMLElement | undefined;
let playerListElement: HTMLUListElement | undefined;
let playerNameElement: HTMLElement | undefined;
let playerNameFormElement: NameFormElement | undefined;
let roundResetButtonElement: HTMLButtonElement | undefined;
let startButtonElement: HTMLButtonElement | undefined;

declare global {
	interface Window {
		// biome-ignore lint/correctness/noUndeclaredVariables: Timer is a Bun global
		timerIntervalId: Timer;
	}
}

// biome-ignore lint/style/useNamingConvention: the issue here is the consecutive upper case characters, but given it's due to using a single-character word, this doesn't feel invalid
const askAQuestion = (question: Question): void => {
	questionElement ||= getElementById("question");
	questionThingElement ||= getElementById("thing");
	questionNumberElement ||= getElementById("number");

	questionElement.style.display = "block";
	questionThingElement.innerText = question.subject;
	questionNumberElement.innerText = question.colours.length.toString();
};

const derenderColourCheckboxes = (): void => {
	checkboxFormElement ||= getElementById<HTMLFormElement>("checkbox-form");

	checkboxFormElement.remove();
	checkboxFormElement = undefined;
};

const derenderPlayerNameForm = (): void => {
	playerNameFormElement ||= getElementById<NameFormElement>("name-form");

	playerNameFormElement.remove();
	playerNameFormElement = undefined;
};

const derenderRoundResetButton = (): void => {
	roundResetButtonElement ||=
		getElementById<HTMLButtonElement>("round-reset-button");

	roundResetButtonElement.style.display = "none";
};

const derenderStartButton = (): void => {
	startButtonElement ||= getElementById<HTMLButtonElement>("start-button");

	startButtonElement.style.display = "none";
};

const indicateConnected = (): void => {
	connectionStatusIconElement ||= getElementById<HTMLDivElement>(
		"connection-status-icon",
	);

	connectionStatusIconElement.innerText = "Connected 🟢";
};

const indicateDisconnected = (): void => {
	connectionStatusIconElement ||= getElementById<HTMLDivElement>(
		"connection-status-icon",
	);

	connectionStatusIconElement.innerText = "Disconnected 🔴";
};

const renderBonusPoints = (bonusPoints: number): void => {
	bonusPointsElement ||= getElementById<HTMLParagraphElement>("bonus-points");

	bonusPointsElement.innerText = `Bonus points: ${bonusPoints}`;
	bonusPointsElement.style.display = "block";
};

const renderColourCheckboxes = (
	emitAnswersPostWrapper: (colours: Answer["colours"]) => void,
): void => {
	colourSectionElement ||= getElementById("colour-section");
	checkboxTemplateElement ||=
		getElementById<HTMLTemplateElement>("checkbox-template");

	const clone = checkboxTemplateElement.content.cloneNode(
		true,
	) as DocumentFragment;

	colourSectionElement.replaceChildren(clone);

	checkboxFormElement ||= getElementById<HTMLFormElement>("checkbox-form");

	checkboxFormElement.addEventListener("submit", (e) => {
		e.preventDefault();
		submitAnswer(emitAnswersPostWrapper);
	});
};

const renderPlayerList = (playerNames: Player["name"][]): void => {
	playerListElement ||= getElementById<HTMLUListElement>("player-list");

	const targetHtml = playerNames.map((name) => `<li>${name}</li>`).join("\n");
	playerListElement.innerHTML = targetHtml;
};

const renderPlayerListWithScores = (playerScores: PlayerScore[]): void => {
	playerListElement ||= getElementById<HTMLUListElement>("player-list");

	const targetHtml = playerScores
		.map(
			(playerScore) =>
				`<li>${playerScore.player.name}: ${playerScore.score}</li>`,
		)
		.join("\n");
	playerListElement.innerHTML = targetHtml;
};

const renderPlayerName = (currentPlayer: Player): void => {
	playerNameElement ||= getElementById<HTMLDivElement>("player-name");

	const targetText = `Name: ${currentPlayer.name}`;
	playerNameElement.innerText = targetText;
};

const renderRoundResetButton = (): void => {
	roundResetButtonElement ||=
		getElementById<HTMLButtonElement>("round-reset-button");

	roundResetButtonElement.style.display = "block";
};

const renderStartButton = (): void => {
	startButtonElement ||= getElementById<HTMLButtonElement>("start-button");

	startButtonElement.style.display = "block";
};

const renderUnjoinableMessage = (): void => {
	playerNameFormElement ||= getElementById<NameFormElement>("name-form");

	const unjoinableMessage = document.createElement("p");
	unjoinableMessage.innerText = "Round in progress. Try again later";

	playerNameFormElement?.replaceWith(unjoinableMessage);
};

const resetPlayerNameFormValue = (): void => {
	playerNameFormElement ||= getElementById<NameFormElement>("name-form");

	playerNameFormElement.elements.name.value = "";
};

const resetRound = (playerNames: Player["name"][]): void => {
	colourSectionElement ||= getElementById("colour-section");
	questionElement ||= getElementById("question");
	questionThingElement ||= getElementById("thing");
	questionNumberElement ||= getElementById("number");

	questionElement.style.display = "none";
	questionThingElement.innerText = "";
	questionNumberElement.innerText = "";
	colourSectionElement.innerHTML = "";
	derenderRoundResetButton();

	if (playerNames.length > 1) {
		renderStartButton();
	}
};

export const renderTimer = (durationMs: number) => {
	countdownTimerElement ||= getElementById<HTMLElement>("countdown-section");
	countdownTimerElement.innerText = "Time remaining:";
	const timeElement = document.createElement("time");
	countdownTimerElement.appendChild(timeElement);

	let remainingTime = durationMs / 1000; // Convert milliseconds to seconds
	timeElement.innerText = `${remainingTime}s`;
	countdownTimerElement.style.display = "block";

	window.timerIntervalId = setInterval(() => {
		remainingTime--;
		timeElement.innerText = `${remainingTime}s`;
		if (remainingTime <= 0) {
			clearInterval(window.timerIntervalId);
		}
	}, 1000);
};

export const derenderTimer = () => {
	countdownTimerElement ||= getElementById("countdown-section");
	countdownTimerElement.innerText = "";

	clearInterval(window.timerIntervalId);
};

const submitAnswer = async (
	emitAnswersPostWrapper: (colours: Answer["colours"]) => void,
): Promise<void> => {
	checkboxFormElement ||= getElementById<HTMLFormElement>("checkbox-form");

	const checkedElements = checkboxFormElement.querySelectorAll(
		'input[type="checkbox"]:checked',
	);
	const colours: Answer["colours"] = Array.from(checkedElements).map(
		(checkedElement) => checkedElement.id as Colour,
	);

	emitAnswersPostWrapper(colours);
	derenderColourCheckboxes();

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

export {
	askAQuestion,
	derenderColourCheckboxes,
	derenderPlayerNameForm,
	derenderRoundResetButton,
	derenderStartButton,
	indicateConnected,
	indicateDisconnected,
	renderBonusPoints,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerListWithScores,
	renderPlayerName,
	renderRoundResetButton,
	renderStartButton,
	renderUnjoinableMessage,
	resetPlayerNameFormValue,
	resetRound,
	submitAnswer,
};
