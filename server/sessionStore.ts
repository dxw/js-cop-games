import type { Session } from "./@types/entities";

export class SessionStore {
	sessions: Map<Session["id"], Session>;

	constructor() {
		this.sessions = new Map();
	}

	findSession(id: Session["id"]) {
		return this.sessions.get(id);
	}

	saveSession(session: Session) {
		this.sessions.set(session.id, session);
	}

	findAllSessions() {
		return [...this.sessions.values()];
	}
}
