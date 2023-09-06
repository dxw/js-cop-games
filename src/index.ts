import { Elysia, ws } from "elysia";
import { html } from "@elysiajs/html";

const page = `<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title>Hello World</title>
    </head>
  
    <body>
        <h1>Hello World</h1>
        <form >
            <input type="text" name="message" />
            <button type="submit">Send</button>
        </form>
        <div id="message-list"></div>
    </body>
    <script>
    var loc = window.location, new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    } else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += loc.pathname + "hi";

    const ws = new WebSocket(new_uri);
    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = e.target.message.value;
        ws.send(message);
    });
    ws.open = (ws) => {
      console.log(ws);
    
  };
    ws.onmessage = (message) => {
        console.log(message.data);
        const newMessageP = document.createElement('p')
        newMessageP.innerText = message.data
        document.getElementById("message-list").appendChild(newMessageP)
    };
</script>
</html>`;

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) => html(page))
  .use(ws())
  .ws("/hi", {
    message(ws, message) {
      console.log({ message, ws });
      ws.send(message);
    },
    open(ws) {
      ws.send("welcome");
    },
  })
  .listen(3000);
