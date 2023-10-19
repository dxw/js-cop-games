## tidyups and refactors
- add a util for getting HTML elements that errors if they aren't found EG:

```ts
const getElementById = (id: string): HTMLElement => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`No element found with id: ${id}`);
  }

  return element
};
```

- add ADRs (one for using Bun, socket.io, not using a frontend framework (for now))
- remove nanobuffer dependency completely
- e2es 
- eslint


## features

- users can pick a colours
- render an answer screen once everyone has answered
- start timer once first person has submitted answers
- track scores
- start a new question after the answer screen
- end game (once someone has reached the score limit)
