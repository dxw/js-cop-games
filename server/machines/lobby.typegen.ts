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
    setQuestion: "playerClicksStart";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isNewPlayer: "playerJoins";
    isOnlyPlayer: "";
  };
  eventsCausingServices: {};
  matchesStates: "Empty" | "GameStart" | "MultiplePlayers" | "OnePlayer";
  tags: never;
}
