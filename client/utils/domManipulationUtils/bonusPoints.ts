import { htmlElements } from ".";
import { getElementById } from "../getElementById";

const renderBonusPoints = (bonusPoints: number): void => {
	htmlElements.bonusPoints ||=
		getElementById<HTMLParagraphElement>("bonus-points");

	htmlElements.bonusPoints.innerText = `Bonus points: ${bonusPoints}`;
	htmlElements.bonusPoints.style.display = "block";
};

export { renderBonusPoints };
