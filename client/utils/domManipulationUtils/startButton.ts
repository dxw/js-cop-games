import { getElementById } from "../getElementById.ts";
import { htmlElements } from "./index.ts";

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
