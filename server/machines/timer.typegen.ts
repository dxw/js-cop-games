
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "runTimer": "done.invoke.(machine).running:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "tick": "TICK";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isCountdownFinished": "";
        };
        eventsCausingServices: {
          "runTimer": "xstate.init";
        };
        matchesStates: "finished" | "running";
        tags: never;
      }
  