import { Player, Question } from "../@types/models";
import Lobby from "../lobby";

export default class ClientboundEvents {
  static getPlayers(
    lobby: Lobby,
  ): [string, { players: Array<Player["name"]> }] {
    return ["players:get", { players: lobby.playerNames() }];
  }

  static getQuestion(question: Question): [string, { question: Question }] {
    return ["question:get", { question }];
  }

  static setPlayer(player: Player): [string, { player: Player }] {
    return ["player:set", { player }];
  }

  static showStartButton(): string {
    return "game:startable";
  }
}
