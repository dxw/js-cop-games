import http from "node:http";
import handler from "serve-handler";
import { SocketServer } from "./socketServer.ts";
import { logWithTime } from "./utils/loggingUtils.ts";

const httpServer = http.createServer((request, response) => {
	return handler(request, response, {
		public: "./client",
	});
});

new SocketServer(httpServer);

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
	logWithTime(`Server running at http://localhost:${port}`),
);
