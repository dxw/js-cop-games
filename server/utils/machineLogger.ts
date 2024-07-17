import type { AnyStateMachine, InspectionEvent } from "xstate";

export const machineLogger = (
	inspectionEvent: InspectionEvent,
	machine: AnyStateMachine["id"],
) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info("\x1b[32m machine: %s \x1b[0m", machine);
		console.table(inspectionEvent.event);
	}
	if (inspectionEvent.type === "@xstate.snapshot") {
		console.info(
			"\x1b[33m  machine: %s \x1b[0m, \n \x1b[42m state: %o \x1b[0m",
			machine,
			inspectionEvent.snapshot.status,
		);
	}
};
