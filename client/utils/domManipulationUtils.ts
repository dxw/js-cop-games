import type { Player } from "../../server/@types/entities";

const renderPlayerList = (
	playerNames: Player["name"][],
	playerListElement: HTMLUListElement,
): void => {
	const html = playerNames.map((name) => `<li>${name}</li>`);
	playerListElement.innerHTML = html.join("\n");
};

export { renderPlayerList };
