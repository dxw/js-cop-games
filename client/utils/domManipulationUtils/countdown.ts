import { htmlElements } from ".";
import { getElementById } from "../getElementById";

type CountdownOptions = {
	durationMs: number;
	description: "Time remaining: " | "Next turn starting in: ";
};

const renderCountdown = ({
	durationMs,
	description,
}: CountdownOptions): void => {
	htmlElements.countdown ||= getElementById("countdown-section");
	htmlElements.countdown.innerText = description;

	const timeElement = document.createElement("time");
	let remainingTime = durationMs / 1000; // Convert milliseconds to seconds
	timeElement.innerText = `${remainingTime}s`;
	htmlElements.countdown.appendChild(timeElement);

	htmlElements.countdown.style.display = "block";

	window.countdownIntervalId = setInterval(() => {
		remainingTime--;
		timeElement.innerText = `${remainingTime}s`;

		if (remainingTime <= 0) {
			clearInterval(window.countdownIntervalId);
		}
	}, 1000);
};

const derenderCountdown = (): void => {
	htmlElements.countdown ||= getElementById("countdown-section");
	htmlElements.countdown.innerText = "";
	htmlElements.countdown.style.display = "none";

	clearInterval(window.countdownIntervalId);
};

export { derenderCountdown, renderCountdown };
export type { CountdownOptions };
