import { beforeEach, describe, expect, it } from 'bun:test'
import { lobbyMachine, isNewPlayer, context } from './lobby'
import { InterpreterFrom, interpret } from 'xstate'

describe('lobbyMachine states', () => {
  const player1 = { socketId: 'id', name: 'a name' }
  const player2 = { socketId: 'id-2', name: 'a name 2' }
  const player3 = { socketId: 'id-3', name: 'a name 3' }

  describe('Empty', () => {
    it('transitions to the OnePlayer state when it receives the player joins event', () => {
      expect(lobbyMachine.transition('Empty', 'playerJoins').value).toBe(
        'OnePlayer'
      )
    })
  })

  describe('OnePlayer', () => {
    let actor: InterpreterFrom<typeof lobbyMachine>

    beforeEach(() => {
      actor = interpret(lobbyMachine)
      actor.start()
      actor.send({
        type: 'playerJoins',
        player: player1
      })
    })

    it('transitions to the MultiplePlayers state when it receives two player joins events', () => {
      actor.send({
        type: 'playerJoins',
        player: player2
      })

      expect(actor.getSnapshot().value).toBe('MultiplePlayers')
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players: [player1, player2]
      })
    })

    it('transitions from OnePlayer to Empty state when it receives player leaves event', () => {
      expect(lobbyMachine.transition('OnePlayer', 'playerLeaves').value).toBe(
        'Empty'
      )
    })

    it('removes a player from the player list when it receives playerLeaves event', () => {
      actor.send({
        type: 'playerLeaves',
        socketId: player1.socketId
      })

      expect(actor.getSnapshot().context.players.length).toEqual(0)
    })
  })

  describe('MultiplePlayers', () => {
    let actor: InterpreterFrom<typeof lobbyMachine>

    beforeEach(() => {
      actor = interpret(lobbyMachine)
      actor.start()

      actor.send({
        type: 'playerJoins',
        player: player1
      })

      actor.send({
        type: 'playerJoins',
        player: player2
      })
    })

    it('transitions from the MultiplePlayers state to the OnePlayer state when it receives a playerLeaves event', () => {
      actor.send({
        type: 'playerLeaves',
        socketId: player2.socketId
      })

      expect(actor.getSnapshot().value).toBe('OnePlayer')
    })

    it('adds more than two players', () => {
      actor.send({
        type: 'playerJoins',
        player: player3
      })

      expect(actor.getSnapshot().value).toBe('MultiplePlayers')
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players: [player1, player2, player3]
      })
    })

    it('transitions from the MultiplePlayers to the GameStart state when sent playerClicksStart event', () => {
      expect(
        lobbyMachine.transition('MultiplePlayers', 'playerClicksStart').value
      ).toBe('GameStart')
    })

    it('transitions to OnePlayer if there is only one player left when playerLeaves', () => {
      actor.send({ type: 'playerLeaves', socketId: player1.socketId })
      expect(actor.getSnapshot().value).toBe('OnePlayer')
    })

    it('does not transition to OnePlayer if there is more than one player left when playerLeaves', () => {
      actor.send({
        type: 'playerJoins',
        player: player3
      })

      actor.send({ type: 'playerLeaves', socketId: player1.socketId })
      expect(actor.getSnapshot().value).toBe('MultiplePlayers')
    })

    it('removes a player from the player list when it receives playerLeaves event', () => {
      actor.send({
        type: 'playerLeaves',
        socketId: player1.socketId
      })

      expect(actor.getSnapshot().context.players).toEqual([player2])
    })
  })

  describe('GameStart', () => {
    let actor: InterpreterFrom<typeof lobbyMachine>

    beforeEach(() => {
      actor = interpret(lobbyMachine)
      actor.start()

      actor.send({
        type: 'playerJoins',
        player: player1
      })

      actor.send({
        type: 'playerJoins',
        player: player2
      })
    })

    describe('given there are two players', () => {
      beforeEach(() => {
        actor.send({ type: 'playerClicksStart' })
      })

      it('transitions from GameStart to OnePlayer when playerLeaves', () => {
        actor.send({ type: 'playerLeaves', socketId: player1.socketId })
        expect(actor.getSnapshot().value).toBe('OnePlayer')
      })

      it('removes a player from the player list when it receives playerLeaves event', () => {
        actor.send({
          type: 'playerLeaves',
          socketId: 'id'
        })

        expect(actor.getSnapshot().context.players).toEqual([player2])
      })
    })

    describe('given there are more than two players', () => {
      beforeEach(() => {
        actor.send({
          type: 'playerJoins',
          player: player3
        })

        actor.send({ type: 'playerClicksStart' })
      })

      it('does not transition to OnePlayer if there is more than one player left when playerLeaves', () => {
        actor.send({ type: 'playerLeaves', socketId: player1.socketId })
        expect(actor.getSnapshot().value).toBe('GameStart')
      })

      it('removes a player from the player list when it receives playerLeaves event', () => {
        actor.send({
          type: 'playerLeaves',
          socketId: 'id'
        })

        expect(actor.getSnapshot().context.players).toEqual([player2, player3])
      })
    })
  })
})

describe('isNewPlayer', () => {
  it('returns true if the player is not present in the players array', () => {
    const player = { socketId: 'id', name: 'a name' }
    const context = { players: [] }

    expect(isNewPlayer(context, { player })).toBe(true)
  })

  it('returns false if the player is present in the players array', () => {
    const player = { socketId: 'id', name: 'a name' }
    const context = { players: [player] }

    expect(isNewPlayer(context, { player })).toBe(false)
  })
})
