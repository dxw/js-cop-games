# 4. Use Biome

Date: 2024-02-14

## Status

Accepted

## Context

As documented in the dxw tech team RFC [Use linting tools across all of our
projects][linters], we use linters and formatters to ensure a standard approach
to the way our code is structured within files.

For JavaScript and TypeScript, we often use some combination of [ESLint][],
[Standard][], and [Prettier][] for these purposes, and had been using ESLint and
Prettier here. However, we've encountered issues getting this to play nice with
[Bun][] in various local development environments, and experiments with Standard
have also proved problematic.

While setting the codebase up to work with a particular set of rules is often
the bulk of the work with linters (rather than ongoing maintenance), the issues
we've encountered on this project have taken time away from more interesting
experiments with state machines, WebSockets, and so on.

[Biome][] is a relatively new linter and formatter. Having been built in Rust,
it's highly performant. It provides a substantial set of [linting rules][] by
default, [many of which come from ESLint or ESLint plugins][linting rule
sources], and has a similar philosophy to Prettier on [opinionated formatting][]
(limited configuration).

## Decision

We will use Biome for linting and formatting our TypeScript and JSON files.

## Consequences

- We will have fewer decisions to make about what linting and formatting rules
  to apply
- We may be unable to use some of the more niche ESLint rules or third-party
  plugins
- We should be able to revert/switch to another linter/formatter if we encounter
  issues

[Biome]: https://biomejs.dev
[Bun]: ./0002-use-bun.md
[ESLint]: https://github.com/search?q=org:dxw+%22eslint%22:+path:package.json&type=code
[linters]: https://github.com/dxw/tech-team-rfcs/blob/main/tools-and-technology/rfc-035-use-linting-tools-across-all-our-projects.md
[linting rule sources]: https://biomejs.dev/linter/rules-sources/#rules-from-other-sources
[linting rules]: https://biomejs.dev/linter/rules
[opinionated formatting]: https://biomejs.dev/formatter
[Prettier]: https://github.com/search?q=org:dxw+%22prettier%22:+path:package.json&type=code
[Standard]: https://github.com/search?q=org%3Adxw+%22standard%22%3A+path%3Apackage.json&type=code
