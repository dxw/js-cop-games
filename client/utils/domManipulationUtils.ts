import type {
	Answer,
	Colour,
	Player,
	Question,
} from "../../server/@types/entities";
import { getElementById } from "./getElementById";

let checkboxFormElement: HTMLFormElement | undefined;
let checkboxTemplateElement: HTMLTemplateElement | undefined;
let colourSectionElement: HTMLElement | undefined;
let questionElement: HTMLElement | undefined;
let questionNumberElement: HTMLElement | undefined;
let questionThingElement: HTMLElement | undefined;
let playerListElement: HTMLUListElement | undefined;
let playerNameElement: HTMLElement | undefined;
let playerNameFormElement: HTMLFormElement | undefined;
let startButtonElement: HTMLButtonElement | undefined;

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
	playerNameFormElement ||= getElementById<HTMLFormElement>("name-form");

	playerNameFormElement.remove();
	playerNameFormElement = undefined;
};

const renderColourCheckboxes = (
	emitAnswersPost: (colours: Answer["colours"]) => void,
): void => {
	colourSectionElement ||= getElementById("colour-section");
	checkboxTemplateElement ||=
		getElementById<HTMLTemplateElement>("checkbox-template");

	const clone = checkboxTemplateElement.content.cloneNode(
		true,
	) as DocumentFragment;

	colourSectionElement.appendChild(clone);

	checkboxFormElement ||= getElementById<HTMLFormElement>("checkbox-form");

	checkboxFormElement.addEventListener("submit", (e) => {
		e.preventDefault();
		submitAnswer(emitAnswersPost);
	});
};

const renderPlayerList = (playerNames: Player["name"][]): void => {
	playerListElement ||= getElementById<HTMLUListElement>("player-list");

	const targetHtml = playerNames.map((name) => `<li>${name}</li>`).join("\n");
	playerListElement.innerHTML = targetHtml;
};

const renderPlayerName = (currentPlayer: Player): void => {
	playerNameElement ||= getElementById<HTMLDivElement>("player-name");

	const targetText = `Name: ${currentPlayer.name}`;
	playerNameElement.innerText = targetText;
};

const renderStartButton = (): void => {
	startButtonElement ||= getElementById<HTMLButtonElement>("start-button");

	startButtonElement.style.display = "block";
};

const submitAnswer = async (
	emitAnswersPost: (colours: Answer["colours"]) => void,
): Promise<void> => {
	checkboxFormElement ||= getElementById<HTMLFormElement>("checkbox-form");

	const checkedElements = checkboxFormElement.querySelectorAll(
		'input[type="checkbox"]:checked',
	);
	const colours: Answer["colours"] = Array.from(checkedElements).map(
		(checkedElement) => checkedElement.id as Colour,
	);

	emitAnswersPost(colours);
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
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderStartButton,
	submitAnswer,
};
