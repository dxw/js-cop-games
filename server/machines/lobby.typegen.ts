// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	"@@xstate/typegen": true;
	internalEvents: {
		"": { type: "" };
		"xstate.init": { type: "xstate.init" };
	};
	invokeSrcNameMap: {};
	missingImplementations: {
		actions: never;
		delays: never;
		guards: never;
		services: never;
	};
	eventsCausingActions: {
		addPlayer: "playerJoins";
		removePlayer: "playerLeaves";
	};
	eventsCausingDelays: {};
	eventsCausingGuards: {
		isNewPlayer: "playerJoins";
		isOnlyPlayer: "";
	};
	eventsCausingServices: {};
	matchesStates: "empty" | "multiplePlayers" | "onePlayer";
	tags: never;
}
