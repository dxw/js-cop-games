import type { Question } from "../../../server/@types/entities.d.ts";
import { getElementById } from "../getElementById.ts";
import { htmlElements } from "./index.ts";

const renderQuestion = (question: Question): void => {
	htmlElements.question ||= getElementById("question");
	htmlElements.questionThing ||= getElementById("thing");
	htmlElements.questionNumber ||= getElementById("number");

	htmlElements.question.style.display = "block";
	htmlElements.questionThing.innerText = question.subject;
	htmlElements.questionNumber.innerText = question.colours.length.toString();
};

export { renderQuestion };
