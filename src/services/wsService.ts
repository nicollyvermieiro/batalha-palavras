import { Game } from '../game/Game';
import validWords from '../../data/words.json';
import { game } from '../game/game.service'; 

const { v4: uuidv4 } = require('uuid');

let rematchRequests = new Set<string>();
let rematchTimeout: NodeJS.Timeout | null = null;

function resetRematch() {
  rematchRequests.clear();
  if (rematchTimeout) {
    clearTimeout(rematchTimeout);
    rematchTimeout = null;
  }
}

export function handleConnection(ws: any, wss: any): void {
  const playerId = uuidv4();
  ws.playerId = playerId;

  ws.on('message', (msg: string) => {
    const data = JSON.parse(msg);

    switch (data.type) {
      case 'join':
        game.addPlayer(playerId, data.name, ws);

        if (game.currentWordObj) {
          ws.send(JSON.stringify({
            type: 'newRound',
            hint: game.currentWordObj.hint,
            length: game.currentWordObj.word.length
          }));
        }

        broadcast({ type: 'playerJoined', playerId, name: data.name }, wss);

        console.log("Jogadores conectados:", game.getPlayersCount());
        if (game.getPlayersCount() >= 2) {
          broadcast({ type: 'gameStart', message: 'O jogo começou! Boa sorte a todos!' }, wss);
        }
        break;

      case 'playWord':
        const result = game.playWord(playerId, data.word);

        if (!result.success) {
          const errorMessage = result.message === 'palavra_repetida'
            ? 'Palavra repetida! Tente outra palavra.'
            : result.message;

          ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
        } else {
          if (result.correct) {
            // Mostra que o jogador acertou
            broadcast({
              type: 'playerGuessedCorrect',
              playerId: result.playerId,
              name: result.name,
              score: result.score,
              word: result.word,
              points: result.points,
              attempts: result.attempts
            }, wss);

            // Atualiza o placar
            broadcast({
              type: 'scoreboard',
              scores: game.getScoreboard()
            }, wss);

            // Se houver vencedor
            if (result.winner) {
              broadcast({
                type: 'gameWinner',
                message: `${result.name} venceu o jogo com ${result.score} pontos!`
              }, wss);
              broadcast({ type: 'showRematch' }, wss);
              resetRematch();
            } else {
              // Espera 3 segundos antes da nova rodada
              setTimeout(() => {
                if (result.nextRound) {
                  broadcast({
                    type: 'newRound',
                    hint: result.nextRound.hint,
                    length: result.nextRound.word.length
                  }, wss);
                }
              }, 3000);
            }
          } else {
            ws.send(JSON.stringify({
              type: 'tryAgain',
              message: result.message,
              attempts: result.attempts
            }));
          }
        }
        break;

      case 'rematchRequest':
        rematchRequests.add(playerId);

        broadcast({
          type: 'rematchStatus',
          count: rematchRequests.size,
          total: game.getPlayersCount()
        }, wss);

        if (rematchRequests.size === game.getPlayersCount()) {
          resetRematch();
          game.resetGame();

          broadcast({
            type: 'gameReset'
          }, wss);

          broadcast({
            type: 'newRound',
            hint: game.currentWordObj?.hint,
            length: game.currentWordObj?.word.length
          }, wss);

          broadcast({
            type: 'scoreboard',
            scores: game.getScoreboard()
          }, wss);

          broadcast({
            type: 'hideRematch'
          }, wss);

        } else if (!rematchTimeout) {
          rematchTimeout = setTimeout(() => {
            resetRematch();
            broadcast({
              type: 'showRematch'
            }, wss);
          }, 30000);
        }
        break;
    }
  });

  ws.on('close', () => {
    game.removePlayer(playerId);
    broadcast({ type: 'playerLeft', playerId }, wss);

    if (rematchRequests.has(playerId)) {
      rematchRequests.delete(playerId);
      broadcast({
        type: 'rematchStatus',
        count: rematchRequests.size,
        total: game.getPlayersCount()
      }, wss);
    }
  });
}

function broadcast(message: any, wss: any) {
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

// Adicione essa função em Game.ts (se ainda não existir)
Game.prototype.getPlayersCount = function () {
  return Object.keys(this.players).length;
};
