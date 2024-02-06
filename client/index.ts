import { io } from "socket.io-client";
import { NameFormElement } from "../server/@types/ui";
import { Player, Question } from "../server/@types/models";
import { getElementById } from "./utils/getElementById";

const addPlayer = async (name: string): Promise<void> => {
  socket.emit("players:post", { name });
};

export type Answers = Array<string>;

const submitAnswers = async (form: HTMLFormElement): Promise<void> => {
  const checked = form.querySelectorAll('input[type="checkbox"]:checked');
  const answers: Answers = Array.from(checked).map((checked) => checked.id);

  socket.emit("answers:post", { answers });
  derenderColorCheckboxes();
  getElementById("colour-section").innerText = `You picked: ${answers.join(
    ", ",
  )}`;
};

const generateSocketUrl = (): string => {
  const location = window.location;

  return "//" + location.host + location.pathname;
};

const renderPlayerList = (): void => {
  const html = players.map((name) => `<li>${name}</li>`);
  playerListElement.innerHTML = html.join("\n");
};

const renderPlayerName = (): void => {
  const text = `Name: ${player.name}`;
  playerNameElement.innerText = text;
};

const askAQuestion = (data: Question): void => {
  const { question, number } = data;
  const questionHtml = getElementById("question");
  questionHtml.innerText = question;
  const numberHtml = getElementById("number");
  numberHtml.innerText = number.toString();
};

const renderColourCheckboxes = (): void => {
  const colourSection = getElementById("colour-section");
  const template = getElementById<HTMLTemplateElement>("checkbox-template");
  const clone = template.content.cloneNode(true) as DocumentFragment;

  colourSection.appendChild(clone);
  const colourForm = getElementById<HTMLFormElement>("checkbox-form");
  colourForm.addEventListener("submit", function (e) {
    e.preventDefault();
    submitAnswers(colourForm);
  });
};

const derenderColorCheckboxes = (): void => {
  getElementById("checkbox-form").remove();
};

const derenderNameForm = (): void => {
  getElementById("name-form").remove();
};

const startButton = getElementById("start-button");

const showStartButton = (): void => {
  startButton.style.display = "block";
};

startButton.addEventListener("click", () => {
  socket.emit("round:start");
});

const derenderStartButton = (): void => {
  startButton.remove();
};

const connectionStatusIconElement = getElementById("connection-status-icon");
const nameFormElement = getElementById("name-form") as NameFormElement;
const playerListElement = getElementById("player-list");
const playerNameElement = getElementById("player-name");

let player: Player;
let players: Array<Player> = [];

const socket = io(generateSocketUrl());

socket.on("connect", () => {
  connectionStatusIconElement.innerText = "Connected 🟢";
});

socket.on("disconnect", () => {
  connectionStatusIconElement.innerText = "Disconnected 🔴";
});

socket.on("players:get", (data) => {
  players = data.players;
  renderPlayerList();
});

socket.on("player:set", (data) => {
  player = data.player;
  renderPlayerName();
  derenderNameForm();
});

socket.on("question:get", (data) => {
  derenderStartButton();
  askAQuestion(data.question);
  renderColourCheckboxes();
});

socket.on("game:startable", () => {
  showStartButton();
});

nameFormElement.addEventListener("submit", function (e) {
  e.preventDefault();
  addPlayer(nameFormElement.elements.name.value);
  nameFormElement.elements.name.value = "";
});
