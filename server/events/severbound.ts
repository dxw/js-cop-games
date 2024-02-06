import type { Server, Socket } from 'socket.io';

import ClientboundEvents from './clientbound';
import type Lobby from '../lobby';
import type { SocketServer } from '../socketServer';

export default class ServerboundEvents {
  static disconnect(lobby: Lobby, socket: Socket, server: Server): [string, () => void] {
    return [
      'disconnect',
      () => {
        console.info(`disconnected: ${socket.id}`);
        lobby.removePlayer(socket.id);
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }

  static postAnswers(socket: Socket): [string, any] {
    return [
      'answers:post',
      (data: any) => {
        console.log('answers', {
          socketId: socket.id,
          ...data,
        });
        socket.emit('round:answers', data.answers);
      },
    ];
  }

  static postPlayers(lobby: Lobby, socket: Socket, server: Server): [string, (data: { name: string }) => void] {
    return [
      'players:post',
      (data: { name: string }) => {
        const player = lobby.addPlayer(data.name, socket.id);
        socket.emit(...ClientboundEvents.setPlayer(player));
        server.emit(...ClientboundEvents.getPlayers(lobby));
      },
    ];
  }

  static startRound(server: SocketServer): [string, () => void] {
    return [
      'round:start',
      () => {
        server.onRoundStarted();
      },
    ];
  }
}
