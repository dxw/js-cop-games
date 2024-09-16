type NameFormElement = HTMLFormElement & {
	elements: HTMLFormControlsCollection & {
		name: HTMLInputElement;
	};
};

const htmlElements: {
	bonusPoints?: HTMLParagraphElement;
	checkboxForm?: HTMLFormElement;
	checkboxTemplate?: HTMLTemplateElement;
	colourSection?: HTMLElement;
	connectionStatus?: HTMLDivElement;
	countdown?: HTMLElement;
	question?: HTMLElement;
	questionNumber?: HTMLElement;
	questionThing?: HTMLElement;
	playerList?: HTMLUListElement;
	playerName?: HTMLElement;
	playerNameForm?: NameFormElement;
	roundResetButton?: HTMLButtonElement;
	startButton?: HTMLButtonElement;
} = {};

declare global {
	interface Window {
		// biome-ignore lint/correctness/noUndeclaredVariables: Timer is a Bun global
		countdownIntervalId: Timer;
	}
}

export { htmlElements };
export type { NameFormElement };
