const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const connectionStatusElement = document.getElementById("connection-status");
let allChat = [];

const urlBuilder = () => {
  var loc = window.location,
    new_uri;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "";
  }
  new_uri += "//" + loc.host;
  new_uri += loc.pathname;
  return new_uri;
};

const socket = io(urlBuilder());

socket.on("connect", () => {
  console.log("connected");
  connectionStatusElement.innerText = "Connected 🟢";
});

socket.on("disconnect", () => {
  connectionStatusElement.innerText = "Not connected 🔴";
});

socket.on("msg:get", (data) => {
  allChat = data.msg;
  render();
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.name.value);
  chat.elements.name.value = "";
});

async function postNewMsg(name) {
  const data = {
    name,
  };

  socket.emit("msg:post", data);
}

function render() {
  const html = allChat.map(({ name }) => template(name));
  msgs.innerHTML = html.join("\n");
}

const template = (name) =>
  `<li class="collection-item"><span class="badge">${name}</span></li>`;
