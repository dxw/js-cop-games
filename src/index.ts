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

    <script src="/socket.io/socket.io.js"></script>

    <script>
      const urlBuilder = () => {
        var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += loc.pathname + "hi";
        return new_uri;
      }

      const ws = new WebSocket(urlBuilder());
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
        console.log('cat');
          console.log(message.data);
          const newMessageP = document.createElement('p')
          newMessageP.innerText = message.data
          document.getElementById("message-list").appendChild(newMessageP)
      };
    </script>
</html>`;

Bun.serve({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.protocol === "ws:") {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }

      return new Response("Upgrade failed :(", { status: 500 });
    }

    return new Response(page, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  websocket: {
    message(ws, message) {
      console.log({ message });
      ws.send(message);
    },
    open(ws) {
      ws.send("welcome");
    },
  },
});
