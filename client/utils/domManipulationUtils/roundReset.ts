import { htmlElements } from ".";
import type { Player } from "../../../server/@types/entities";
import { getElementById } from "../getElementById";
import { renderStartButton } from "./startButton";

const renderRoundResetButton = (): void => {
	htmlElements.roundResetButton ||=
		getElementById<HTMLButtonElement>("round-reset-button");

	htmlElements.roundResetButton.style.display = "block";
};

const derenderRoundResetButton = (): void => {
	htmlElements.roundResetButton ||=
		getElementById<HTMLButtonElement>("round-reset-button");

	htmlElements.roundResetButton.style.display = "none";
};

const resetRound = (playerNames: Player["name"][]): void => {
	htmlElements.colourSection ||= getElementById("colour-section");
	htmlElements.question ||= getElementById("question");
	htmlElements.questionThing ||= getElementById("thing");
	htmlElements.questionNumber ||= getElementById("number");

	htmlElements.question.style.display = "none";
	htmlElements.questionThing.innerText = "";
	htmlElements.questionNumber.innerText = "";
	htmlElements.colourSection.innerHTML = "";
	derenderRoundResetButton();

	if (playerNames.length > 1) {
		renderStartButton();
	}
};

export { renderRoundResetButton, resetRound };
