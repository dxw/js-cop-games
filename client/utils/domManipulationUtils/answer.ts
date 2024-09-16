import { htmlElements } from ".";
import type { Answer, Colour } from "../../../server/@types/entities";
import { getElementById } from "../getElementById";
import { derenderColourCheckboxes } from "./colourCheckboxes";

const submitAnswer = async (
	emitAnswersPostWrapper: (colours: Answer["colours"]) => void,
): Promise<void> => {
	htmlElements.checkboxForm ||=
		getElementById<HTMLFormElement>("checkbox-form");
	htmlElements.colourSection ||= getElementById("colour-section");

	const checkedElements = htmlElements.checkboxForm.querySelectorAll(
		'input[type="checkbox"]:checked',
	);
	const colours: Answer["colours"] = Array.from(checkedElements).map(
		(checkedElement) => checkedElement.id as Colour,
	);

	emitAnswersPostWrapper(colours);
	derenderColourCheckboxes();

	const answeredColourCards = colours.map(
		(colour) =>
			`<div class="colour-cards__card colour-cards__card--${colour}">
				<p>${colour[0].toUpperCase()}${colour.slice(1)}</p>
			</div>`,
	);

	htmlElements.colourSection.innerHTML = `
		<h2>Your selection</h2>
		<div class="colour-cards">
			${answeredColourCards.join("")}
		</div>
	`;
};

export { submitAnswer };
