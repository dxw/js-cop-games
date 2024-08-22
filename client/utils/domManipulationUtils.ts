import { type ElementNames, elements } from "..";
import type {
	Answer,
	Colour,
	Player,
	Question,
} from "../../server/@types/entities";
import type { NameFormElement } from "../../server/@types/ui";
import { getElementById } from "./getElementById";

let checkboxTemplateElement: HTMLTemplateElement | undefined;
let colourSectionElement: HTMLElement | undefined;
let playerNameFormElement: NameFormElement | undefined;

export const populateElements = (elementNames: ElementNames) => {
	for (const elementName of elementNames) {
		elements[elementName] ||= getElementById(elementName);
	}
};

// biome-ignore lint/style/useNamingConvention: the issue here is the consecutive upper case characters, but given it's due to using a single-character word, this doesn't feel invalid
const askAQuestion = (question: Question): void => {
	elements.question.style.display = "block";
	elements.thing.innerText = question.subject;
	elements.number.innerText = question.colours.length.toString();
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

	colourSectionElement.appendChild(clone);

	elements["checkbox-form"].addEventListener("submit", (e) => {
		e.preventDefault();
		submitAnswer(emitAnswersPostWrapper);
	});
};

const renderPlayerList = (playerNames: Player["name"][]): void => {
	const targetHtml = playerNames.map((name) => `<li>${name}</li>`).join("\n");
	elements["player-list"].innerHTML = targetHtml;
};

const renderPlayerName = (currentPlayer: Player): void => {
	const targetText = `Name: ${currentPlayer.name}`;
	elements["player-name"].innerText = targetText;
};

const renderUnjoinableMessage = (): void => {
	const unjoinableMessage = document.createElement("p");
	unjoinableMessage.innerText = "Round in progress. Try again later";

	elements["name-form"]?.replaceWith(unjoinableMessage);
};

const resetPlayerNameFormValue = (): void => {
	playerNameFormElement ||= getElementById<NameFormElement>("name-form");

	playerNameFormElement.elements.name.value = "";
};

const resetRound = (playerNames: Player["name"][]): void => {
	elements.question.style.display = "none";
	elements.thing.innerText = "";
	elements.number.innerText = "";
	elements["colour-section"].innerHTML = "";

	elements["round-reset-button"].style.display = "none";

	if (playerNames.length > 1) {
		elements["start-button"].style.display = "block";
	}
};

const submitAnswer = async (
	emitAnswersPostWrapper: (colours: Answer["colours"]) => void,
): Promise<void> => {
	const checkedElements = elements["checkbox-form"].querySelectorAll(
		'input[type="checkbox"]:checked',
	);
	const colours: Answer["colours"] = Array.from(checkedElements).map(
		(checkedElement) => checkedElement.id as Colour,
	);

	emitAnswersPostWrapper(colours);

	elements["checkbox-form"].style.display = "none";

	const answeredColourCards = colours.map(
		(colour) =>
			`<div class="colour-cards__card colour-cards__card--${colour}">
				<p>${colour[0].toUpperCase()}${colour.slice(1)}</p>
			</div>`,
	);

	elements["colour-section"].innerHTML = `
		<h2>Your selection</h2>
		<div class="colour-cards">
			${answeredColourCards.join("")}
		</div>
	`;
};

export {
	askAQuestion,
	renderColourCheckboxes,
	renderPlayerList,
	renderPlayerName,
	renderUnjoinableMessage,
	resetPlayerNameFormValue,
	resetRound,
	submitAnswer,
};
