import { io } from "socket.io-client";
import { NameFormElement } from "../server/@types/ui";
import { Player, Question } from "../server/@types/models";
import { getElementById } from "./utils/getElementById";
import colours from "../server/data/colours.json";

const addPlayer = async (name: string): Promise<void> => {
  socket.emit("players:post", { name });
};

const submitAnswers = async (form: HTMLFormElement): Promise<void> => {
  const checked = form.querySelectorAll('input[type="checkbox"]:checked');
  const answers = Array.from(checked).map((checked) => checked.id);
  socket.emit("answers:post", { answers });
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
  const fieldset = clone.querySelector("fieldset") as HTMLElement;

  colours.forEach((colour) => {
    const checkboxWrapper = document.createElement("div");
    const input = getInput(colour);
    const label = getLabelFor(colour);
    checkboxWrapper.appendChild(input);
    checkboxWrapper.appendChild(label);

    fieldset.appendChild(checkboxWrapper);
  });
  colourSection.appendChild(clone);
  const colourForm = getElementById<HTMLFormElement>("checkbox-form");
  colourForm.addEventListener("submit", function (e) {
    e.preventDefault();
    submitAnswers(colourForm);
  });
};

const getInput = (id: string): HTMLInputElement => {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  input.name = id;
  return input;
};

const getLabelFor = (id: string): HTMLLabelElement => {
  const label = document.createElement("label");
  label.htmlFor = id;
  label.innerText = id;
  return label;
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
