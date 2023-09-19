import { io } from "socket.io-client";
import { nameFormElement } from "../server/@types/ui";

const addPlayer = async (name: string): Promise<void> => {
  socket.emit("players:post", { name });
};

const generateSocketUrl = (): string => {
  const location = window.location;

  return "//" + location.host + location.pathname;
};

const renderPlayerList = (): void => {
  const html = players.map((name) => `<li>${name}</li>`);
  playerListElement.innerHTML = html.join("\n");
};

const connectionStatusIconElement = document.getElementById(
  "connection-status-icon",
) as HTMLElement;
const nameFormElement = document.getElementById("name-form") as nameFormElement;
const playerListElement = document.getElementById(
  "player-list",
) as HTMLFormElement;

let players: Array<string> = [];

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

nameFormElement.addEventListener("submit", function (e) {
  e.preventDefault();
  addPlayer(nameFormElement.elements.name.value);
  nameFormElement.elements.name.value = "";
});
