import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import Game from './game'
import { Question } from './@types/models'
import * as OutboundEvents from './events/outbound'
import * as IncomingEvents from './events/incoming'

export class SocketServer {
  game: Game
  server: Server

  constructor (httpServer: HttpServer) {
    this.game = new Game(this)
    this.server = new Server(httpServer, {})
  }

  create (): void {
    this.server.on('connection', (socket) => {
      console.info(`connected: ${socket.id}`)

      socket.emit(...OutboundEvents.getPlayers(this.game))
      socket.on(...IncomingEvents.postPlayers(this.game, socket, this.server))
      socket.on(...IncomingEvents.disconnect(this.game, socket, this.server))
    })
  }

  onQuestionSet (question: Question): void {
    this.server.emit(...OutboundEvents.getQuestion(question))
  }

  onShowStartButton (): void {
    this.server.emit(OutboundEvents.showStartButton())
  }
}
