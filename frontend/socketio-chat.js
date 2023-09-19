const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
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
  presence.innerText = "🟢";
});

socket.on("disconnect", () => {
  presence.innerText = "🔴";
});

socket.on("msg:get", (data) => {
  allChat = data.msg;
  render();
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  socket.emit("msg:post", data);
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
