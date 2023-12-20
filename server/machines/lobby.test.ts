import { describe, expect, it } from "bun:test";
import { lobbyMachine, isNewPlayer, context } from "./lobby";
import { interpret } from "xstate";

describe("lobbyMachine states", () => {
  describe("Empty", () => {
    it("transitions to the OnePlayer state when it receives the player joins event", () => {
      expect(lobbyMachine.transition("Empty", "playerJoins").value).toBe(
        "OnePlayer",
      );
    });
  });

  describe("OnePlayer", () => {
    it("transitions to the MultiplePlayers state when it receives two player joins events", () => {
      const actor = interpret(lobbyMachine);
      actor.start();
      const player1 = { socketId: "id", name: "a name" };
      const player2 = { socketId: "id-2", name: "a name 2" };
      const players = [player1, player2];

      players.forEach((player) => {
        actor.send({
          type: "playerJoins",
          player: player,
        });
      });

      expect(actor.getSnapshot().value).toBe("MultiplePlayers");
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players,
      });
    });

    it("transitions from OnePlayer to Empty state when it receives player leaves event", () => {
      expect(lobbyMachine.transition("OnePlayer", "playerLeaves").value).toBe(
        "Empty",
      );
    });
  });

  describe("MultiplePlayers", () => {
    it("transitions from the MultiplePlayers state to the OnePlayer state it receives two player joins events followed by a playerLeaves event", () => {
      const actor = interpret(lobbyMachine);
      actor.start();

      actor.send({
        type: "playerJoins",
        player: { socketId: "id", name: "a name" },
      });
      actor.send({
        type: "playerJoins",
        player: { socketId: "id-2", name: "a name 2" },
      });
      actor.send({
        type: "playerLeaves",
        socketId: "id-2",
      });

      expect(actor.getSnapshot().value).toBe("OnePlayer");
    });

    it("adds more than two players", () => {
      const actor = interpret(lobbyMachine);
      actor.start();
      const player1 = { socketId: "id", name: "a name" };
      const player2 = { socketId: "id-2", name: "a name 2" };
      const player3 = { socketId: "id-3", name: "a name 3" };
      const players = [player1, player2, player3];

      players.forEach((player) => {
        actor.send({
          type: "playerJoins",
          player: player,
        });
      });

      expect(actor.getSnapshot().value).toBe("MultiplePlayers");
      expect(actor.getSnapshot().context).toEqual({
        ...context,
        players: [player1, player2, player3],
      });
    });

    it("transitions from the MultiplePlayers to the GameStart state when sent playerClicksStart event", () => {
      expect(
        lobbyMachine.transition("MultiplePlayers", "playerClicksStart").value,
      ).toBe("GameStart");
    });

    it("transitions to OnePlayer if there is only one player left when playerLeaves", () => {
      const actor = interpret(lobbyMachine);
      actor.start();
      const player1 = { socketId: "id", name: "a name" };
      const player2 = { socketId: "id-2", name: "a name 2" };

      const players = [player1, player2];

      players.forEach((player) => {
        actor.send({
          type: "playerJoins",
          player: player,
        });
      });

      actor.send({ type: "playerLeaves", socketId: "id" });
      expect(actor.getSnapshot().value).toBe("OnePlayer");
    });
  });

  describe("GameStart", () => {
    it("transitions from GameStart to OnePlayer if there is only one player left when playerLeaves", () => {
      const actor = interpret(lobbyMachine);
      actor.start();
      const player1 = { socketId: "id", name: "a name" };
      const player2 = { socketId: "id-2", name: "a name 2" };

      const players = [player1, player2];

      players.forEach((player) => {
        actor.send({
          type: "playerJoins",
          player: player,
        });
      });

      actor.send({ type: "playerClicksStart" });
      expect(actor.getSnapshot().value).toBe("GameStart");

      actor.send({ type: "playerLeaves", socketId: "id" });
      expect(actor.getSnapshot().value).toBe("OnePlayer");
    });

    it("does not transition to OnePlayer if there is more than one player left when playerLeaves", () => {
      const players = [
        { socketId: "id", name: "a name" },
        { socketId: "id-2", name: "a name 2" },
        { socketId: "id-3", name: "a name 3" },
      ];

      const actor = interpret(lobbyMachine);
      actor.start();

      players.forEach((player) => {
        actor.send({
          type: "playerJoins",
          player: player,
        });
      });

      actor.send({ type: "playerClicksStart" });
      expect(actor.getSnapshot().value).toBe("GameStart");

      actor.send({ type: "playerLeaves", socketId: "id" });
      expect(actor.getSnapshot().value).toBe("GameStart");
    });
  });
});

describe("isNewPlayer", () => {
  it("returns true if the player is not present in the players array", () => {
    const player = { socketId: "id", name: "a name" };
    const context = { players: [] };

    expect(isNewPlayer(context, { player })).toBe(true);
  });

  it("returns false if the player is present in the players array", () => {
    const player = { socketId: "id", name: "a name" };
    const context = { players: [player] };

    expect(isNewPlayer(context, { player })).toBe(false);
  });
});
