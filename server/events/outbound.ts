import { Player, Question } from '../@types/models'
import Game from '../game'

const getPlayers = (game: Game): [string, { players: Array<Player['name']> }] => {
  return ['players:get', { players: game.playerNames() }]
}

const getQuestion = (question: Question): [string, { question: Question }] => {
  return ['question:get', { question }]
}

const setPlayer = (player: Player): [string, { player: Player }] => {
  return ['player:set', { player }]
}

const showStartButton = (): string => {
  return 'game:startable'
}

export { getPlayers, getQuestion, setPlayer, showStartButton }
