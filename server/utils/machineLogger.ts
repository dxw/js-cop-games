import type { InspectionEvent } from "xstate";

export const machineLogger = (
	inspectionEvent: InspectionEvent,
	machine: "turn" | "round",
) => {
	if (inspectionEvent.type === "@xstate.event") {
		console.info(inspectionEvent.event);
	}
};
