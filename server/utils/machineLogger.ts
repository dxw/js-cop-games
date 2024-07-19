import type { AnyStateMachine, InspectionEvent } from "xstate";

const consoleColourCodes = {
	text: {
		green: "\x1b[32m",
		yellow: "\x1b[33m",
	},
	reset: "\x1b[0m",
};

export const machineLogger = (
	inspectionEvent: InspectionEvent,
	machine: AnyStateMachine["id"],
) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info(
			[
				consoleColourCodes.text.green,
				"\nXState event",
				consoleColourCodes.reset,
				`\nMachine: ${machine}`,
			].join(""),
		);

		console.table(inspectionEvent.event);
	}

	if (inspectionEvent.type === "@xstate.snapshot") {
		console.info(
			[
				consoleColourCodes.text.yellow,
				"\nXState snapshot",
				consoleColourCodes.reset,
				`\nMachine: ${machine}`,
				`\nState: ${inspectionEvent.snapshot.status}`,
			].join(""),
		);
	}
};
