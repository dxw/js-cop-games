import type { InspectionEvent } from "xstate";

const consoleColourCodes = {
	text: {
		green: "\x1b[32m",
		yellow: "\x1b[33m",
	},
	reset: "\x1b[0m",
};

const getMachineId = (inspectionEvent: InspectionEvent) => {
	return inspectionEvent.actorRef.getSnapshot().machine.id;
};

const machineLogger = (inspectionEvent: InspectionEvent) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info(
			[
				`\n${currentTime()} `,
				consoleColourCodes.text.green,
				"XState event",
				consoleColourCodes.reset,
				`\nMachine: ${getMachineId(inspectionEvent)}`,
			].join(""),
		);

		console.table(inspectionEvent.event);
	}

	if (inspectionEvent.type === "@xstate.snapshot") {
		console.info(
			[
				`\n${currentTime()} `,
				consoleColourCodes.text.yellow,
				"XState snapshot",
				consoleColourCodes.reset,
				`\nMachine: ${getMachineId(inspectionEvent)}`,
				`\nState: ${inspectionEvent.actorRef.getSnapshot().value}`,
				"\nContext:",
			].join(""),
		);
		console.info(inspectionEvent.actorRef.getSnapshot().context);
	}
};

const currentTime = () => {
	return new Date().toLocaleTimeString("en-GB");
};

export { currentTime, machineLogger };
