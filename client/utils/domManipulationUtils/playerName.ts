import type { Player } from "../../../server/@types/entities.d.ts";
import { getElementById } from "../getElementById.ts";
import { type NameFormElement, htmlElements } from "./index.ts";

const renderPlayerName = (currentPlayer: Player): void => {
	htmlElements.playerName ||= getElementById<HTMLDivElement>("player-name");

	const targetText = `Name: ${currentPlayer.name}`;
	htmlElements.playerName.innerText = targetText;
};

const derenderPlayerNameForm = (): void => {
	htmlElements.playerNameForm ||= getElementById<NameFormElement>("name-form");

	htmlElements.playerNameForm.remove();
	htmlElements.playerNameForm = undefined;
};

const resetPlayerNameFormValue = (): void => {
	htmlElements.playerNameForm ||= getElementById<NameFormElement>("name-form");

	htmlElements.playerNameForm.elements.name.value = "";
};

export { renderPlayerName, derenderPlayerNameForm, resetPlayerNameFormValue };
