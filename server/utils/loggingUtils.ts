import type { InspectionEvent } from "xstate";

const consoleColourCodes = {
	text: {
		green: "\x1b[32m",
		yellow: "\x1b[33m",
	},
	reset: "\x1b[0m",
};

const colouredConsoleString = (
	unformattedString: string,
	textColour: keyof (typeof consoleColourCodes)["text"],
) => {
	return [
		consoleColourCodes.text[textColour],
		unformattedString,
		consoleColourCodes.reset,
	].join("");
};

const getMachineId = (inspectionEvent: InspectionEvent) => {
	return inspectionEvent.actorRef.getSnapshot().machine.id;
};

const logWithTime = (
	inlineString: string,
	subsequentLinesString?: string,
	additionalLogCallback?: () => void,
) => {
	const currentTime = new Date().toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
	});

	console.info(
		[`\n${currentTime} ${inlineString}`, subsequentLinesString]
			.filter((string) => string)
			.join("\n"),
	);

	if (additionalLogCallback) {
		additionalLogCallback();
	}
};

const machineLogger = (inspectionEvent: InspectionEvent) => {
	if (inspectionEvent.type === "@xstate.event") {
		logWithTime(
			colouredConsoleString("XState event", "green"),
			`Machine: ${getMachineId(inspectionEvent)}`,
			() => console.table(inspectionEvent.event),
		);
	}

	if (inspectionEvent.type === "@xstate.snapshot") {
		logWithTime(
			colouredConsoleString("XState snapshot", "yellow"),
			[
				`Machine: ${getMachineId(inspectionEvent)}`,
				`State: ${inspectionEvent.actorRef.getSnapshot().value}`,
				"Context:",
			].join("\n"),
			() => console.info(inspectionEvent.actorRef.getSnapshot().context),
		);
	}
};

export { logWithTime, machineLogger };
