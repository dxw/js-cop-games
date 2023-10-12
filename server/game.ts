import { Socket } from "socket.io";
import { Player, Question } from "./@types/models";
import questions from "./data/questions.json";

export class Game {
  players: Array<Player> = [];
  currentQuestion?: Question;

  addPlayer = (name: Player["name"], socketId: Socket["id"]): Player => {
    const player: Player = { name, socketId };
    this.players.push(player);

    return player;
  };

  getPlayerNames = (): Array<Player["name"]> => {
    return this.players.map((player) => player.name).reverse();
  };

  removePlayer = (socketId: Socket["id"]): void => {
    this.players = this.players.filter(
      (player) => player.socketId !== socketId,
    );
  };

  start = (): void => {
    this.setQuestion();
  };

  setQuestion = (): void => {
    const questionIndex = Math.floor(Math.random() * questions.length);
    this.currentQuestion = questions[questionIndex];
  };
}
