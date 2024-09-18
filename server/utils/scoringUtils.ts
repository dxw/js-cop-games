import type { Answer, Player, PlayerScore, Question } from "../@types/entities";

const allCorrect = (
	totalPlayerCount: number,
	correctPlayerSocketIds: Player["sessionId"][],
): boolean => {
	return correctPlayerSocketIds.length === totalPlayerCount;
};

const allIncorrect = (
	correctPlayerSocketIds: Player["sessionId"][],
): boolean => {
	return correctPlayerSocketIds.length === 0;
};

const getUpdatedPlayerScores = (
	currentPlayerScores: PlayerScore[],
	bonusPoints: number,
	correctPlayerSocketIds: Player["sessionId"][],
): PlayerScore[] => {
	const numberOfIncorrectAnswers =
		currentPlayerScores.length - correctPlayerSocketIds.length;
	const pointsToAward = numberOfIncorrectAnswers + bonusPoints;

	return currentPlayerScores.map(({ player, score }) => {
		if (correctPlayerSocketIds.includes(player.sessionId)) {
			return { player, score: score + pointsToAward };
		}

		return { player, score };
	});
};

const getUpdatedPlayerScoresAndBonusPoints = (
	currentBonusPoints: number,
	currentPlayerScores: PlayerScore[],
	correctPlayerSocketIds: Player["sessionId"][],
): { bonusPoints: number; playerScores: PlayerScore[] } => {
	if (allCorrect(currentPlayerScores.length, correctPlayerSocketIds)) {
		return {
			bonusPoints: currentBonusPoints + 1,
			playerScores: currentPlayerScores,
		};
	}

	if (allIncorrect(correctPlayerSocketIds)) {
		return { bonusPoints: 0, playerScores: currentPlayerScores };
	}

	return {
		bonusPoints: 0,
		playerScores: getUpdatedPlayerScores(
			currentPlayerScores,
			currentBonusPoints,
			correctPlayerSocketIds,
		),
	};
};

const getCorrectSessionIdsFromAnswers = (
	answers: Answer[],
	correctAnswer: Question["colours"],
) => {
	return answers
		.filter((answer) => {
			if (correctAnswer.length !== answer.colours.length) {
				return false;
			}

			return correctAnswer.every((colour) => answer.colours.includes(colour));
		})
		.map((answer) => answer.socketId);
};

export {
	getCorrectSessionIdsFromAnswers,
	getUpdatedPlayerScoresAndBonusPoints,
};
