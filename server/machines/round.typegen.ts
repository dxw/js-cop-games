// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	"@@xstate/typegen": true;
	internalEvents: {
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
		addAnswer: "playerSubmitsAnswer";
		setQuestion: "xstate.init";
	};
	eventsCausingDelays: {};
	eventsCausingGuards: {};
	eventsCausingServices: {};
	matchesStates: "roundStart";
	tags: never;
}
