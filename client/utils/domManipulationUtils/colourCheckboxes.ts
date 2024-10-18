import type { Answer } from "../../../server/@types/entities.d.ts";
import { getElementById } from "../getElementById.ts";
import { submitAnswer } from "./answer.ts";
import { htmlElements } from "./index.ts";

const renderColourCheckboxes = (
	emitAnswersPostWrapper: (colours: Answer["colours"]) => void,
): void => {
	htmlElements.checkboxTemplate ||=
		getElementById<HTMLTemplateElement>("checkbox-template");
	htmlElements.colourSection ||= getElementById("colour-section");

	const clone = htmlElements.checkboxTemplate.content.cloneNode(
		true,
	) as DocumentFragment;
	htmlElements.colourSection.replaceChildren(clone);

	htmlElements.checkboxForm ||=
		getElementById<HTMLFormElement>("checkbox-form");
	htmlElements.checkboxForm.addEventListener("submit", (e) => {
		e.preventDefault();
		submitAnswer(emitAnswersPostWrapper);
	});
};

const derenderColourCheckboxes = (): void => {
	htmlElements.checkboxForm ||=
		getElementById<HTMLFormElement>("checkbox-form");

	htmlElements.checkboxForm.remove();
	htmlElements.checkboxForm = undefined;
};

export { derenderColourCheckboxes, renderColourCheckboxes };
