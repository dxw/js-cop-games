import { getElementById } from "../getElementById.ts";
import { htmlElements } from "./index.ts";

const renderConnectedIndicator = (): void => {
	htmlElements.connectionStatus ||=
		getElementById<HTMLDivElement>("connection-status");

	htmlElements.connectionStatus.innerText = "Connected 🟢";
};

const renderDisconnectedIndicator = (): void => {
	htmlElements.connectionStatus ||=
		getElementById<HTMLDivElement>("connection-status");

	htmlElements.connectionStatus.innerText = "Disconnected 🔴";
};

export { renderConnectedIndicator, renderDisconnectedIndicator };
