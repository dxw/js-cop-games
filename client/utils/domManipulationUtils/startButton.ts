import { htmlElements } from ".";
import { getElementById } from "../getElementById";

const renderStartButton = (): void => {
	htmlElements.startButton ||=
		getElementById<HTMLButtonElement>("start-button");

	htmlElements.startButton.style.display = "block";
};

const derenderStartButton = (): void => {
	htmlElements.startButton ||=
		getElementById<HTMLButtonElement>("start-button");

	htmlElements.startButton.style.display = "none";
};

export { derenderStartButton, renderStartButton };
