# server architecture

## file descriptions

### `types/**/*.d.ts`

| Responsibilities | Collaborators       |
|------------------|---------------------|
| - Define types   | - `lobby.ts`        |
|                  | - `socketServer.ts` |
|                  | - `events/*.ts`     |
|                  | - `machines/*.ts`   |




### `data/*.json`

| Responsibilities    | Collaborators |
|---------------------|---------------|
| - Store static data | - `round.ts`  |



### `events/serverbound.ts`


| Responsibilities                    | Collaborators       |
|-------------------------------------|---------------------|
| -  websocket server event listeners | - `socketServer.ts` |




### `events/clientbound.ts`


| Responsibilities                                  | Collaborators             |
|---------------------------------------------------|---------------------------|
| - server websocket events to be used in listeners | - `socketServer.ts`       |
|                                                   | - `events/serverbound.ts` |




### `machines/lobby.ts`


| Responsibilities            | Collaborators       |
|-----------------------------|---------------------|
| - adds players to game      | - `models/lobby.ts` |
| - removes players from game |                     |

### `machines/round.ts`


| Responsibilities                         | Collaborators       |
|------------------------------------------|---------------------|
| - sets the question                      | - `models/round.ts` |
| - receives responses to the question     |                     |
| - determines correctness of responses    |                     |
| - determines when to end the round       |                     |
| - determines points players win or loose |                     |


### `index.ts`


| Responsibilities                          | Collaborators       |
|-------------------------------------------|---------------------|
| - instantiates the socket and HTTP server | - `socketServer.ts` |


### `models/lobby.ts` 


| Responsibilities                                                               | Collaborators         |
|--------------------------------------------------------------------------------|-----------------------|
| - interfaces between the client and serverbound events and lobby state machine | - `machines/lobby.ts` |
|                                                                                | - `socketServer.ts`   |
|                                                                                | - `events/*.ts`       |



### `models/round.ts`



| Responsibilities                                                               | Collaborators         |
|--------------------------------------------------------------------------------|-----------------------|
| - interfaces between the client and serverbound events and round state machine | - `machines/round.ts` |
|                                                                                | - `socketServer.ts`   |
|                                                                                | - `events/*.ts`       |




### `socketServer.ts`

defines socket.io server-level events and sets up a few on initialisation



| Responsibilities              | Collaborators   |
|-------------------------------|-----------------|
| - instatiates models          | - `index.ts`    |
| - communicates between models | - `models/*.ts` |
| - emits events to client      | - `events/*.ts` |
