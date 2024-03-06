import http from "http";
import handler from "serve-handler";
import { SocketServer } from "./socketServer";

const httpServer = http.createServer((request, response) => {
	// biome-ignore lint/suspicious/noExplicitAny: we don't have a fix for this yet
	return handler(request as any, response as any, {
		public: "./client",
	});
});

// biome-ignore lint/suspicious/noExplicitAny: we don't have a fix for this yet
new SocketServer(httpServer as any);

const port = process.env.PORT || 8080;

httpServer.listen(port, () =>
	console.info(`Server running at http://localhost:${port}`),
);
