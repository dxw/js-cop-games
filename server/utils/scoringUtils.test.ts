import { describe, expect, it } from "bun:test";
import type { Colour } from "../@types/entities";
import { getCorrectSocketIdsFromAnswers } from "./scoringUtils";

describe("scoringUtils", () => {
	describe("getCorrectSocketIdsFromAnswers", () => {
		const correctAnswer: Colour[] = ["red", "blue"];
		const incorrectAnswer: Colour[] = ["pink", "blue"];

		it("returns the IDs of the players with the correct answers", () => {
			expect(
				getCorrectSocketIdsFromAnswers(
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
				getCorrectSocketIdsFromAnswers(
					[
						{ colours: incorrectAnswer, socketId: "1" },
						{ colours: incorrectAnswer, socketId: "2" },
					],
					correctAnswer,
				),
			).toBeArrayOfSize(0);
		});
	});
});
