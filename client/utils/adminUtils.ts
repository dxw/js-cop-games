import { renderRoundResetButton } from "./domManipulationUtils/roundReset";

const konamiCode: KeyboardEvent["key"][] = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

const turnAdminModeOn = (): void => {
	renderRoundResetButton();
};

const addAdminModeListener = (): void => {
	let konamiCodePosition = 0;

	document.addEventListener("keydown", (event) => {
		const nextKey = konamiCode[konamiCodePosition];

		if (event.key === nextKey) {
			konamiCodePosition++;

			if (konamiCodePosition === konamiCode.length) {
				turnAdminModeOn();
				konamiCodePosition = 0;
			}
		} else {
			konamiCodePosition = 0;
		}
	});
};

export { addAdminModeListener, konamiCode };
