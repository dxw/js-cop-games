const connectionStatusIconElement = document.getElementById(
  "connection-status-icon",
);
const nameFormElement = document.getElementById("name-form");
const playerListElement = document.getElementById("player-list");

let players = [];

const socket = io(generateSocketUrl());

socket.on("connect", () => {
  connectionStatusIconElement.innerText = "Connected 🟢";
});

socket.on("disconnect", () => {
  connectionStatusIconElement.innerText = "Not connected 🔴";
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

async function addPlayer(name) {
  socket.emit("players:post", { name });
}

function generateSocketUrl() {
  let url = "";

  const location = window.location;

  url += "//" + location.host + location.pathname;

  return url;
}

function renderPlayerList() {
  const html = players.map((name) => `<li>${name}</li>`);
  playerListElement.innerHTML = html.join("\n");
}
