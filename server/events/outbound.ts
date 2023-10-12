import { Player, Question } from "../@types/models";
import Game from "../game";

export default class OutboundEvents {
  static getPlayers(game: Game): [string, { players: Array<Player["name"]> }] {
    return ["players:get", { players: game.getPlayerNames() }];
  }

  static getQuestion(question: Question): [string, { question: Question }] {
    return ["question:get", { question }];
  }

  static setPlayer(player: Player): [string, { player: Player }] {
    return ["player:set", { player }];
  }
}
