# 1. Use Bun

Date: 2023-10-24

## Status

Accepted

## Context

We need a server-side JavaScript runtime to use in this project.

[Node](https://nodejs.org/en) is the default choice as it is by far the most
widely used, and we've used it in our work with the Ministry of Justice and the
Department for Business, Energy and Industrial Strategy (now the Department for
Science, Innovation and Technology ).

However, in order to get many critical features of a modern server-side
JavaScript app, you typically need to extend Node with third-party packages.
There a lot of decisions to be made around which tools to use, and then you need
to configure those tools to work together, which can take a considerable amount
of time.

[Bun](https://bun.sh), meanwhile, comes with its own test runner, TypeScript
support, bundler, package management, JSX support etc. All of this means less
time spent during project setup on choosing and installing dependencies. On top
of that, it's highly compatibile with existing Node projects. Time is valuable
and therefore being able to get a project up and running quickly is important.

The JavaScript Community of Practice (JS CoP) games project is internal and
experimental in its nature and would therefore be a good opportunity to assess
Bun's viability for future client projects.

## Decision

We will use Bun as the JavaScript runtime for the JS CoP's games project.

## Consequences

- We will be less familiar with Bun than Node to start with so it may take
  longer to build things
- We should be able to revert to Node should we want to as it is highly
  compatible with Bun
- We will have fewer decisions to make around which tools to use for testing,
  TypeScript support, bundling etc
- Bun is production ready but it is still a new technology that isn't as fully
  featured as Node so we should be aware of where useful features aren't
  implemented
