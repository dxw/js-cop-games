import type { Answer, Question } from "../@types/entities";

const getCorrectSocketIdsFromAnswers = (
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

export { getCorrectSocketIdsFromAnswers };
