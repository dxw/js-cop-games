import { describe, expect, it } from "bun:test";
import type { Colour, Player, PlayerScore } from "../@types/entities";
import {
	getCorrectSessionIdsFromAnswers,
	getUpdatedPlayerScoresAndBonusPoints,
} from "./scoringUtils";

describe("scoringUtils", () => {
	describe("getCorrectSessionIdsFromAnswers", () => {
		const correctAnswer: Colour[] = ["red", "blue"];
		const incorrectAnswer: Colour[] = ["pink", "blue"];

		it("returns the IDs of the players with the correct answers", () => {
			expect(
				getCorrectSessionIdsFromAnswers(
					[
						{ colours: correctAnswer, socketId: "1" },
						{ colours: incorrectAnswer, socketId: "2" },
						{ colours: correctAnswer, socketId: "3" },
					],
					correctAnswer,
				),
			).toEqual(["1", "3"]);
		});

		it("returns an empty array if there are no correct answers", () => {
			expect(
				getCorrectSessionIdsFromAnswers(
					[
						{ colours: incorrectAnswer, socketId: "1" },
						{ colours: incorrectAnswer, socketId: "2" },
					],
					correctAnswer,
				),
			).toBeArrayOfSize(0);
		});
	});

	describe("getUpdatedPlayerScoresAndBonusPoints", () => {
		describe("if all players are correct", () => {
			it("increments the bonus points and returns the player scores unchanged", () => {
				const currentBonusPoints = 0;
				const correctPlayerSocketIds = ["1", "2"];
				const currentPlayerScores: PlayerScore[] = [
					{
						player: { name: "olaf", sessionId: correctPlayerSocketIds[0] },
						score: 1,
					},
					{
						player: { name: "alex", sessionId: correctPlayerSocketIds[1] },
						score: 0,
					},
				];

				expect(
					getUpdatedPlayerScoresAndBonusPoints(
						currentBonusPoints,
						currentPlayerScores,
						correctPlayerSocketIds,
					),
				).toEqual({
					bonusPoints: 1,
					playerScores: currentPlayerScores,
				});
			});
		});

		describe("if all players are incorrect", () => {
			it("resets the bonus points and returns the player scores unchanged", () => {
				const currentBonusPoints = 3;
				const correctPlayerSocketIds: Player["sessionId"][] = [];
				const currentPlayerScores: PlayerScore[] = [
					{
						player: { name: "olaf", sessionId: "1" },
						score: 1,
					},
					{
						player: { name: "alex", sessionId: "2" },
						score: 0,
					},
				];

				expect(
					getUpdatedPlayerScoresAndBonusPoints(
						currentBonusPoints,
						currentPlayerScores,
						correctPlayerSocketIds,
					),
				).toEqual({
					bonusPoints: 0,
					playerScores: currentPlayerScores,
				});
			});
		});

		describe("if some players are correct and others incorrect", () => {
			describe("and there are no bonus points", () => {
				it("awards points to the correct players and returns the player scores", () => {
					const currentBonusPoints = 2;
					const correctPlayerSocketIds = ["1", "3"];
					const currentPlayerScores: PlayerScore[] = [
						{
							player: { name: "olaf", sessionId: correctPlayerSocketIds[0] },
							score: 0,
						},
						{
							player: { name: "alex", sessionId: "2" },
							score: 0,
						},
						{
							player: { name: "james", sessionId: correctPlayerSocketIds[1] },
							score: 0,
						},
					];

					expect(
						getUpdatedPlayerScoresAndBonusPoints(
							currentBonusPoints,
							currentPlayerScores,
							correctPlayerSocketIds,
						),
					).toEqual({
						bonusPoints: 0,
						playerScores: [
							{ player: { name: "olaf", sessionId: "1" }, score: 3 },
							{ player: { name: "alex", sessionId: "2" }, score: 0 },
							{ player: { name: "james", sessionId: "3" }, score: 3 },
						],
					});
				});
			});
		});
	});
});
