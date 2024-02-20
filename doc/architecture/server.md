# server architecture

## file descriptions

### `types/**/*.d.ts`

type definitions

#### users

- `lobby.ts`
- `socketServer.ts`
- `events/*.ts`
- `machines/*.ts`

### `data/*.json`

static data

#### users

- `round.ts`

### `events/*.ts`

socket.io event listener/message method (`on`/`event`) argument builders

#### users

- `socketServer.ts`
- other files of the same category

### `machines/*.ts`

XState state machines

#### users

- `lobby.ts` + `round.ts`

### `index.ts`

app initialisation

### `lobby.ts` + `round.ts`

interface between socket.io events (`events/*.ts`) and XState state machines
(`machines/*.ts`). In Rails conceptual framework, these are like models

#### users

- `socketServer.ts`
- `events/*.ts`
- `machines/*.ts`

### `socketServer.ts`

defines socket.io server-level events and sets up a few on initialisation

#### users

- `index.ts`
- `events/*.ts`
- `lobby.ts` + `round.ts`

## flow (incomplete)

1. `index.ts` creates a HTTP server and an instance of our `SocketServer` class,
and starts the HTTP server
2. the `SockerServer` instance creates an instance of our `Lobby` class and an
instance of the socket.io `Server` class, then listens for new socket connections
3. when new sockets connect, the `SockerServer` instance adds listeners
4. the lobby starts up the lobby machine
