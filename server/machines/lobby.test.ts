import { beforeEach, describe, expect, it } from "bun:test";
import type { Actor } from "xstate";
import { createActor, getNextSnapshot } from "xstate";
import { context, lobbyMachine } from "./lobby";

describe("lobbyMachine states", () => {
	const player1 = { name: "a name", socketId: "id" };
	const player2 = { name: "a name 2", socketId: "id-2" };
	const player3 = { name: "a name 3", socketId: "id-3" };

	describe("empty", () => {
		it("transitions to the onePlayer state when it receives the player joins event", () => {
			expect(
				getNextSnapshot(
					lobbyMachine,
					lobbyMachine.resolveState({
						value: "empty",
						context: { players: [] },
					}),
					{
						type: "playerJoins",
						player: player1,
					},
				).value,
			).toBe("onePlayer");
		});
	});

	describe("onePlayer", () => {
		let actor: Actor<typeof lobbyMachine>;

		beforeEach(() => {
			actor = createActor(lobbyMachine);
			actor.start();
			actor.send({
				player: player1,
				type: "playerJoins",
			});
		});

		it("transitions to the multiplePlayers state when it receives two player joins events", () => {
			actor.send({
				player: player2,
				type: "playerJoins",
			});

			expect(actor.getSnapshot().value).toBe("multiplePlayers");
			expect(actor.getSnapshot().context).toEqual({
				...context,
				players: [player1, player2],
			});
		});

		it("transitions from onePlayer to empty state when it receives player leaves event", () => {
			expect(
				getNextSnapshot(
					lobbyMachine,
					lobbyMachine.resolveState({
						value: "onePlayer",
						context: { players: [player1] },
					}),
					{ type: "playerLeaves", socketId: player1.socketId },
				).value,
			).toBe("empty");
		});

		it("removes a player from the player list when it receives playerLeaves event", () => {
			actor.send({
				socketId: player1.socketId,
				type: "playerLeaves",
			});

			expect(actor.getSnapshot().context.players.length).toEqual(0);
		});
	});

	describe("multiplePlayers", () => {
		let actor: Actor<typeof lobbyMachine>;

		beforeEach(() => {
			actor = createActor(lobbyMachine);
			actor.start();

			actor.send({
				player: player1,
				type: "playerJoins",
			});

			actor.send({
				player: player2,
				type: "playerJoins",
			});
		});

		it("transitions from the multiplePlayers state to the onePlayer state when it receives a playerLeaves event", () => {
			actor.send({
				socketId: player2.socketId,
				type: "playerLeaves",
			});

			expect(actor.getSnapshot().value).toBe("onePlayer");
		});

		it("adds more than two players", () => {
			actor.send({
				player: player3,
				type: "playerJoins",
			});

			expect(actor.getSnapshot().value).toBe("multiplePlayers");
			expect(actor.getSnapshot().context).toEqual({
				...context,
				players: [player1, player2, player3],
			});
		});

		it("transitions to onePlayer if there is only one player left when playerLeaves", () => {
			actor.send({
				socketId: player1.socketId,
				type: "playerLeaves",
			});

			expect(actor.getSnapshot().value).toBe("onePlayer");
		});

		it("does not transition to onePlayer if there is more than one player left when playerLeaves", () => {
			actor.send({
				player: player3,
				type: "playerJoins",
			});

			actor.send({
				socketId: player1.socketId,
				type: "playerLeaves",
			});

			expect(actor.getSnapshot().value).toBe("multiplePlayers");
		});

		it("removes a player from the player list when it receives playerLeaves event", () => {
			actor.send({
				socketId: player1.socketId,
				type: "playerLeaves",
			});

			expect(actor.getSnapshot().context.players).toEqual([player2]);
		});
	});
});
