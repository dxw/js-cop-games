# Colour Me Knowledgeable

A game built to help dxwers hone their JavaScript knowledge, based on [Colourbrain](https://bigpotato.co.uk/products/colourbrain).

## Developing locally

### Setup

To install all dependencies necessary for running the server locally, run:

```sh
script/setup
```

### Running the server

To start the local bun server, run:

```sh
script/server
```

To allow other people to join the game running locally you'll need to share your port. There are a couple of ways you can do this.

1. Use [`ngrok`](https://ngrok.com/docs/getting-started/) - installed with the setup script. You'll need to create an account with Ngrok for this.
2. Use VS Code's terminal port sharing - we've had some issues with this not working very well locally, but you may have more luck!

If you're developing solo, you can simulate the game being played by multiple players by opening localhost in a different browser or private browsing tab.

### Extensions

A list of recommended extensions to help with the developer experience can be found in `.vscode/extensions.json`. You may be prompted to install these when opening the repository in VS Code.

## Architecture

This repo uses ADRs, head to [the ADR directory](./doc/architecture/decisions/) to read them.

Architecture diagrams are available in [the diagrams directory](./doc/architecture/diagrams/).
