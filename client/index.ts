import { io } from "socket.io-client";
import { nameFormElement } from "../server/@types/ui";
import { Player, Question } from "../server/@types/models";

const addPlayer = async (name: string): Promise<void> => {
  socket.emit("players:post", { name });
};

const generateSocketUrl = (): string => {
  const location = window.location;

  return "//" + location.host + location.pathname;
};

const getNameFormElement = (): nameFormElement =>
  document.getElementById("name-form") as nameFormElement;

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
  const questionHtml = document.getElementById('question') as HTMLElement;
  questionHtml.innerText = question
  const numberHtml = document.getElementById('number') as HTMLElement;
  numberHtml.innerText = number.toString();
};

const derenderNameForm = (): void => {
  getNameFormElement().remove();
};

const connectionStatusIconElement = document.getElementById(
  "connection-status-icon",
) as HTMLElement;
const nameFormElement = getNameFormElement();
const playerListElement = document.getElementById(
  "player-list",
) as HTMLFormElement;
const playerNameElement = document.getElementById("player-name") as HTMLElement;

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
  askAQuestion(data);
});

nameFormElement.addEventListener("submit", function (e) {
  e.preventDefault();
  addPlayer(nameFormElement.elements.name.value);
  nameFormElement.elements.name.value = "";
});
