import type { AnyStateMachine, InspectionEvent } from "xstate";

const consoleColourCodes = {
	text: {
		green: "\x1b[32m",
		yellow: "\x1b[33m",
	},
	reset: "\x1b[0m",
};

const machineLogger = (
	inspectionEvent: InspectionEvent,
	machine: AnyStateMachine["id"],
) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info(
			[
				`\n${currentTime()} `,
				consoleColourCodes.text.green,
				"XState event",
				consoleColourCodes.reset,
				`\nMachine: ${machine}`,
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
				`\nMachine: ${machine}`,
				`\nState: ${inspectionEvent.actorRef.getSnapshot().value}`,
			].join(""),
		);
	}
};

const currentTime = () => {
	return new Date().toLocaleTimeString("en-GB");
};

export { currentTime, machineLogger };
