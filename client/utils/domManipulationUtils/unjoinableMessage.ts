import { htmlElements } from ".";
import type { NameFormElement } from "../../../server/@types/ui";
import { getElementById } from "../getElementById";

const renderUnjoinableMessage = (): void => {
	htmlElements.playerNameForm ||= getElementById<NameFormElement>("name-form");

	const unjoinableMessage = document.createElement("p");
	unjoinableMessage.innerText = "Round in progress. Try again later";

	htmlElements.playerNameForm?.replaceWith(unjoinableMessage);
};

export { renderUnjoinableMessage };
