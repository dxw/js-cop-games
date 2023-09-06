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
    </body>
    <script>
    const ws = new WebSocket("ws://localhost:3000/hi");
    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = e.target.message.value;
        ws.send(message);
    });
    ws.onmessage = (message) => {
        console.log(message.data);
    };
</script>
</html>`;

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) => html(page))
  .use(ws())
  .ws("/hi", {
    message(ws, message) {
      ws.send(message);
    },
    open(ws) {
      ws.send("welcome");
    },
  })
  .listen(3000);
