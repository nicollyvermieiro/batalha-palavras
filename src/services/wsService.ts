import { Game } from '../game/Game';
import validWords from '../../data/words.json';

const { v4: uuidv4 } = require('uuid');

const game = new Game(validWords);

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
            broadcast({
              type: 'playerGuessedCorrect',
              playerId: result.playerId,
              name: result.name,
              score: result.score,
              word: result.word,
              points: result.points,
              attempts: result.attempts
            }, wss);
          
            if (result.winner) {
              // Ao anunciar o vencedor, ativamos o estado de "aguardando revanche"
              broadcast({
                type: 'gameWinner',
                message: `${result.name} venceu o jogo com ${result.score} pontos!`
              }, wss);

              // Mostra botão de revanche para todos
              broadcast({
                type: 'showRematch'
              }, wss);
              console.log('✅ Evento showRematch enviado');

              // Reseta qualquer estado antigo de revanche
              resetRematch();
            }
          
            if (result.nextRound) {
              broadcast({
                type: 'newRound',
                hint: result.nextRound.hint,
                length: result.nextRound.word.length
              }, wss);
            }
          
            broadcast({
              type: 'scoreboard',
              scores: game.getScoreboard()
            }, wss);          
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
        
            // Broadcast para todos que o jogo foi resetado
            broadcast({
              type: 'gameReset'  // << aqui - novo tipo para resetar UI localmente
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

    // Se um jogador sair, remove ele dos pedidos de revanche (caso tivesse pedido)
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
Game.prototype.getPlayersCount = function() {
  return Object.keys(this.players).length;
};
