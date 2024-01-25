import { assign, createMachine } from 'xstate';

interface TimerContext {
  // The elapsed time (in seconds)
  elapsed: number;
  // The maximum time (in seconds)
  duration: number;
  // The interval to send TICK events (in seconds)
  interval: number;
}

type TimerEvent =
  | {
      // The TICK event sent by the spawned interval service
      type: 'TICK';
    };

export const timerMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgCcBXffAqAYgG0AGAXUVAAcB7WXAF1xd87EAA9EAJgDMADhISAjDIDsANgkBWZSoCcCplIA0IAJ6TpJVQp0zrAFiYSmGxQF9XxtFjyFSlarR0ACoAkgDCANLMbEgg3LwCQiLiCHqWUhIyTHoyOkwKGhpGpoi2JBpMlQrKshUSdhqq7p4YOATEJABmBLiw2JCMrCLx-ILCsSlS+SR2qiqqdsoSqsrWGsZmCNXKltYyUlJWCpr57h4g+FwQcCJebb7DPKNJE4gAtAob76oklX--AOUzRAdx8HX8NHwUEeCTGyUQiy+WxkEhmRQUDQqyh0diki2BoPapG6ND6kBhz3GoBSdkWJB0ijyFSqGgUhyRih+mQWDOcbKsTTOQA */
  initial: 'running',
  context: {
    elapsed: 0,
    duration: 5,
    interval: 0.1
  },
  schema: {
    context: {} as TimerContext,
    events: {} as TimerEvent,
  },
  states: {
    running: {
      invoke: {
        src: 'runTimer'
      },
      on: {
        '': {
          target: 'finished',
          cond: 'isCountdownFinished'
        },
        TICK: {
          actions: 'tick'
        }
      }
    },
    finished: {}
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  tsTypes: {} as import("./timer.typegen").Typegen0,
}, 
{ 
  actions: {
    tick: assign({
      elapsed: (context) =>
        +(context.elapsed + context.interval).toFixed(2)
    }),
  }, 
  guards: {
    isCountdownFinished: (context) => context.elapsed >= context.duration
  },
  services: {
    runTimer: (context) => (cb) => {
      const interval = setInterval(() => {
        cb('TICK');
      }, 1000 * context.interval);

      return () => {
        clearInterval(interval);
      };
    }
  }
});
