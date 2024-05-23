import type { InspectionEvent } from "xstate";

export const machineLogger = (
	inspectionEvent: InspectionEvent,
	machine: "turn" | "round",
) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info(inspectionEvent.event, `machine: ${machine}`);
	}
	if (inspectionEvent.type === "@xstate.snapshot") {
		console.info(inspectionEvent.snapshot, `machine: ${machine}`);
	}
};
