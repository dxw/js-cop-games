import { beforeEach, describe, expect, it } from 'bun:test';
import type { InterpreterFrom } from 'xstate';
import { interpret } from 'xstate';

import { context, isNewPlayer, lobbyMachine } from './lobby';

describe('lobbyMachine states', () => {
  const player1 = { name: 'a name', socketId: 'id' };
  const player2 = { name: 'a name 2', socketId: 'id-2' };
  const player3 = { name: 'a name 3', socketId: 'id-3' };

  describe('Empty', () => {
    it('transitions to the OnePlayer state when it receives the player joins event', () => {
      expect(lobbyMachine.transition('Empty', 'playerJoins').value).toBe('OnePlayer');
    });
  });

  describe('OnePlayer', () => {
    let actor: InterpreterFrom<typeof lobbyMachine>;

    beforeEach(() => {
      actor = interpret(lobbyMachine);
      actor.start();
      actor.send({
        player: player1,
        type: 'playerJoins',
      });
    });

    it('transitions to the MultiplePlayers state when it receives two player joins events', () => {
      actor.send({
        player: player2,
        type: 'playerJoins',
      });

      expect(actor.getSnapshot().value).toBe('MultiplePlayers');
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players: [player1, player2],
      });
    });

    it('transitions from OnePlayer to Empty state when it receives player leaves event', () => {
      expect(lobbyMachine.transition('OnePlayer', 'playerLeaves').value).toBe('Empty');
    });

    it('removes a player from the player list when it receives playerLeaves event', () => {
      actor.send({
        socketId: player1.socketId,
        type: 'playerLeaves',
      });

      expect(actor.getSnapshot().context.players.length).toEqual(0);
    });
  });

  describe('MultiplePlayers', () => {
    let actor: InterpreterFrom<typeof lobbyMachine>;

    beforeEach(() => {
      actor = interpret(lobbyMachine);
      actor.start();

      actor.send({
        player: player1,
        type: 'playerJoins',
      });

      actor.send({
        player: player2,
        type: 'playerJoins',
      });
    });

    it('transitions from the MultiplePlayers state to the OnePlayer state when it receives a playerLeaves event', () => {
      actor.send({
        socketId: player2.socketId,
        type: 'playerLeaves',
      });

      expect(actor.getSnapshot().value).toBe('OnePlayer');
    });

    it('adds more than two players', () => {
      actor.send({
        player: player3,
        type: 'playerJoins',
      });

      expect(actor.getSnapshot().value).toBe('MultiplePlayers');
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players: [player1, player2, player3],
      });
    });

    it('transitions to OnePlayer if there is only one player left when playerLeaves', () => {
      actor.send({
        socketId: player1.socketId,
        type: 'playerLeaves',
      });

      expect(actor.getSnapshot().value).toBe('OnePlayer');
    });

    it('does not transition to OnePlayer if there is more than one player left when playerLeaves', () => {
      actor.send({
        player: player3,
        type: 'playerJoins',
      });

      actor.send({
        socketId: player1.socketId,
        type: 'playerLeaves',
      });

      expect(actor.getSnapshot().value).toBe('MultiplePlayers');
    });

    it('removes a player from the player list when it receives playerLeaves event', () => {
      actor.send({
        socketId: player1.socketId,
        type: 'playerLeaves',
      });

      expect(actor.getSnapshot().context.players).toEqual([player2]);
    });
  });
});

describe('isNewPlayer', () => {
  it('returns true if the player is not present in the players array', () => {
    const player = { name: 'a name', socketId: 'id' };
    const context = { players: [] };

    expect(isNewPlayer(context, { player })).toBe(true);
  });

  it('returns false if the player is present in the players array', () => {
    const player = { name: 'a name', socketId: 'id' };
    const context = { players: [player] };

    expect(isNewPlayer(context, { player })).toBe(false);
  });
});
