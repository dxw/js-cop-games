import type { Player, PlayerScore } from "../../../server/@types/entities.d.ts";
import { getElementById } from "../getElementById.ts";
import { htmlElements } from "./index.ts";

const renderPlayerList = (playerNames: Player["name"][]): void => {
	htmlElements.playerList ||= getElementById<HTMLUListElement>("player-list");

	const targetHtml = playerNames.map((name) => `<li>${name}</li>`).join("\n");
	htmlElements.playerList.innerHTML = targetHtml;
};

const renderPlayerListWithScores = (playerScores: PlayerScore[]): void => {
	htmlElements.playerList ||= getElementById<HTMLUListElement>("player-list");

	const targetHtml = playerScores
		.map(
			(playerScore) =>
				`<li>${playerScore.player.name}: ${playerScore.score}</li>`,
		)
		.join("\n");
	htmlElements.playerList.innerHTML = targetHtml;
};

export { renderPlayerList, renderPlayerListWithScores };
