"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const game_service_1 = require("../game/game.service");
const { v4: uuidv4 } = require('uuid');
let rematchRequests = new Set();
let rematchTimeout = null;
function resetRematch() {
    rematchRequests.clear();
    if (rematchTimeout) {
        clearTimeout(rematchTimeout);
        rematchTimeout = null;
    }
}
function handleConnection(ws, wss) {
    const playerId = uuidv4();
    ws.playerId = playerId;
    ws.on('message', (msg) => {
        var _a, _b;
        const data = JSON.parse(msg);
        switch (data.type) {
            case 'join':
                game_service_1.game.addPlayer(playerId, data.name, ws);
                if (game_service_1.game.currentWordObj) {
                    ws.send(JSON.stringify({
                        type: 'newRound',
                        hint: game_service_1.game.currentWordObj.hint,
                        length: game_service_1.game.currentWordObj.word.length
                    }));
                }
                broadcast({ type: 'playerJoined', playerId, name: data.name }, wss);
                console.log("Jogadores conectados:", game_service_1.game.getPlayersCount());
                if (game_service_1.game.getPlayersCount() >= 2) {
                    broadcast({ type: 'gameStart', message: 'O jogo começou! Boa sorte a todos!' }, wss);
                }
                break;
            case 'playWord':
                const result = game_service_1.game.playWord(playerId, data.word);
                if (!result.success) {
                    const errorMessage = result.message === 'palavra_repetida'
                        ? 'Palavra repetida! Tente outra palavra.'
                        : result.message;
                    ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
                }
                else {
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
                        broadcast({
                            type: 'scoreboard',
                            scores: game_service_1.game.getScoreboard()
                        }, wss);
                        if (result.winner) {
                            broadcast({
                                type: 'gameWinner',
                                message: `${result.name} venceu o jogo com ${result.score} pontos!`
                            }, wss);
                            broadcast({ type: 'showRematch' }, wss);
                            resetRematch();
                        }
                        else {
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
                    }
                    else {
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
                    total: game_service_1.game.getPlayersCount()
                }, wss);
                if (rematchRequests.size === game_service_1.game.getPlayersCount()) {
                    resetRematch();
                    game_service_1.game.resetGame();
                    broadcast({ type: 'gameReset' }, wss);
                    broadcast({
                        type: 'newRound',
                        hint: (_a = game_service_1.game.currentWordObj) === null || _a === void 0 ? void 0 : _a.hint,
                        length: (_b = game_service_1.game.currentWordObj) === null || _b === void 0 ? void 0 : _b.word.length
                    }, wss);
                    broadcast({
                        type: 'scoreboard',
                        scores: game_service_1.game.getScoreboard()
                    }, wss);
                    broadcast({ type: 'hideRematch' }, wss);
                }
                else if (!rematchTimeout) {
                    rematchTimeout = setTimeout(() => {
                        resetRematch();
                        broadcast({ type: 'showRematch' }, wss);
                    }, 30000);
                }
                break;
        }
    });
    ws.on('close', () => {
        game_service_1.game.removePlayer(playerId);
        broadcast({ type: 'playerLeft', playerId }, wss);
        if (rematchRequests.has(playerId)) {
            rematchRequests.delete(playerId);
            broadcast({
                type: 'rematchStatus',
                count: rematchRequests.size,
                total: game_service_1.game.getPlayersCount()
            }, wss);
        }
    });
}
function broadcast(message, wss) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });
}
