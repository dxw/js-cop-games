import { assign, fromCallback, setup } from "xstate";

export const timerMachine = setup({
  actors: {
    ticks: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: 'TICK' });
      }, 10);
      return () => clearInterval(interval);
    })
  }
}).createMachine({
  id: 'stopwatch',
  initial: 'running',
  context: {
    elapsed: 15
  },
  states: {
    stopped: {
      on: {
        start: 'running'
      }
    },
    running: {
      invoke: {
        src: 'ticks'
      },
      on: {
        TICK: {
          actions: assign({
            elapsed: ({ context }) => context.elapsed - 1
          })
        },
        stop: 'stopped'
      }
    }
  },
  on: {
    reset: {
      actions: assign({
        elapsed: 15
      }),
      target: '.stopped'
    }
  }
});
