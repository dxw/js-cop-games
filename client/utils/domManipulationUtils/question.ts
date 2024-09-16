import { htmlElements } from ".";
import type { Question } from "../../../server/@types/entities";
import { getElementById } from "../getElementById";

const renderQuestion = (question: Question): void => {
	htmlElements.question ||= getElementById("question");
	htmlElements.questionThing ||= getElementById("thing");
	htmlElements.questionNumber ||= getElementById("number");

	htmlElements.question.style.display = "block";
	htmlElements.questionThing.innerText = question.subject;
	htmlElements.questionNumber.innerText = question.colours.length.toString();
};

export { renderQuestion };
