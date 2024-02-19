# 3. Use Game class to interact with state machine

Date: 2023-11-20

## Status

Accepted

## Context

We have a state machine[1] that manages the application state. We need a way to
send events from the client to the server and visa versa.

## Decision

We will use the Game class[2] as an intermediary between the socket.io server
and the state machine.

[1]('https://github.com/dxw/js-cop-games/blob/efc9a1d2679c01007e4c8f85389cb03d52483385/server/machines/lobby.ts')
[2]('https://github.com/dxw/js-cop-games/blob/efc9a1d2679c01007e4c8f85389cb03d52483385/server/game.ts')

## Consequences

- The client will never directly interact with the state machine
- The state machine will never directly interact with the socket.io server
- There will be seperation of concerns between the state machine and the
  socket.io server
- The Game class could become large and cumbersome, we should be mindful of
  opportunities for breaking it into smaller classes
