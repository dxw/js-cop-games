import type { Player, Question } from "../@types/models";

import type Lobby from "../lobby";

export default class ClientboundEvents {
  static getPlayers(
    lobby: Lobby,
  ): ClientboundSocketServerEvent<{ players: Array<string> }> {
    return ["players:get", { players: lobby.playerNames() }];
  }

  static getQuestion(
    question: Question,
  ): ClientboundSocketServerEvent<{ question: Question }> {
    return ["question:get", { question }];
  }

  static setPlayer(
    player: Player,
  ): ClientboundSocketServerEvent<{ player: Player }> {
    return ["player:set", { player }];
  }

  static showStartButton(): ClientboundSocketServerEvent {
    return "game:startable";
  }
}
type Event = "players:get" | "question:get" | "player:set" | "game:startable";

type ClientboundSocketServerEvent<T = void> = T extends Record<string, unknown>
  ? [Event, T]
  : Event;
