import { createMachine, assign } from 'xstate'
import { Player } from '../@types/models'

interface Question {
  answer: string[]
  number: number
  question: string
}

export interface Context {
  players: Player[]
  questions: Question[]
  selectedQuestion: Question | undefined
}

export const context: Context = {
  players: [],
  questions: [],
  selectedQuestion: undefined
}

export type Events =
  | {
    type: 'playerJoins'
    player: Player
  }
  | {
    type: 'playerLeaves'
    socketId: Player['socketId']
  }
  | {
    type: 'playerClicksStart'
  }
  | undefined

export const isNewPlayer = (
  { players }: { players: Player[] },
  { player: playerFromEvent }: { player: Player }
): boolean =>
  players.find((player) => player.socketId === playerFromEvent.socketId) ===
  undefined

export const isOnlyPlayer = ({ players }: { players: Player[] }): boolean =>
  players.length === 1

const schema: {
  context: Context
  events: Events
} = {
  context, events: undefined
}

export const lobbyMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QBsD2AjdBPAdAUQFsAHAFywGIjkBDLMAJwClUBLAO1gG0AGAXUVBFUsFiRao2AkAA9EANgCMcnAHZuAZgUAWABwqArHICc69SoA0ILIgUqVOI-s0AmBTudbuW-c4C+vyzRMXAB5NjAABRo6ekpohmZ2Lj4pIRExCSlZBEVlNU1dA2NTCytENSMcOXVndyMdBXUtdS9-QIxsHDDI+NiqWgYAGTBqADc4Hn4kEDTRcUlp7IqcJyNG2p1uZyaFS2sEBpwtIxP6-SNvdTlXNpAgzoBZAFdkMSoegfpYOM+AYWQWABjADWsAAyiRqPQSJNUsI5plFohnM57Co3Cprs1uPpvLsygh9CotKpMV5PApcWs-AE7h1cM9Xix3lFPt9+jFhmMJilprMMgtQNkfDhNtxNsYdFoVLV0XtkbiVioGijjhccddbvcGS83sgPjF2b1EhxYXz4QKsohzkdMUTDIZuE73HJ5QhKTocAoPKdnJKjHJNbTtThGXqDQxvmbBBb5laECi0RisS1cfp8fsmsojNwsSZnFsPDotfScABxagEMAQqEkH6ckbjZJTGPpONIhDNSqmAvGZzp7Sot1aOT6I65jz6HHqfS4jwl4LlyvVyHQ8jRmaxxFC+RKVQabR6QwmMxu87OL3cExS70oi5yfy0tioCBwKTauFt7cyRAAWgzf5jqcwEgSc6gLp0hCkPsrYIoKP6EgoCjjtcchOhcM7aG6SHcCs5w6BcWjNAoXhOBBoThKyMSfnB8Z6J6o7XA0Ow1G4bpNGOlJYnInhaKixz6ORoa6sy+pUZGNGWh20rsYYOAHpOMoEdogZCRWVY1tCkntjunZ7twyqNO4uZduoZ6BqK5xXO4OgtNUNL+EAA */
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    tsTypes: {} as import('./lobby.typegen').Typegen0,
    schema,
    predictableActionArguments: true,
    id: 'lobby',
    initial: 'Empty',
    context,
    states: {
      Empty: {
        on: { playerJoins: { target: 'OnePlayer', actions: 'addPlayer' } }
      },
      OnePlayer: {
        on: {
          playerJoins: {
            target: 'MultiplePlayers',
            actions: 'addPlayer',
            cond: 'isNewPlayer'
          },
          playerLeaves: {
            target: 'Empty',
            actions: 'removePlayer'
          }
        }
      },
      MultiplePlayers: {
        always: {
          target: 'OnePlayer',
          cond: 'isOnlyPlayer'
        },
        on: {
          playerClicksStart: 'GameStart',
          playerLeaves: { actions: 'removePlayer' },
          playerJoins: { actions: 'addPlayer' }
        }
      },
      GameStart: {
        entry: ['setQuestion'],
        always: {
          target: 'OnePlayer',
          cond: 'isOnlyPlayer'
        },
        on: {
          playerLeaves: { actions: 'removePlayer' }
        }
      }
    }
  },
  {
    actions: {
      addPlayer: assign({
        players: ({ players }, { player }) => [...players, player]
      }),
      removePlayer: assign({
        players: ({ players }, { socketId }) =>
          players.filter((p) => p.socketId !== socketId)
      }),
      setQuestion: assign({
        selectedQuestion: ({ questions }) => {
          const questionIndex = Math.floor(
            Math.random() * (questions.length - 1)
          )
          return questions[questionIndex]
        }
      })
    },
    guards: {
      isNewPlayer,
      isOnlyPlayer
    }
  }
)
