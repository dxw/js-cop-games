import type { Player } from "../../server/@types/entities";
import { getElementById } from "./getElementById";

let playerListElement: HTMLUListElement | undefined;
let playerNameElement: HTMLElement | undefined;

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

export { renderPlayerList, renderPlayerName };
