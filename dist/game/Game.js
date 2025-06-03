"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(validWords) {
        this.players = new Map();
        this.words = [];
        this.currentWordObj = null;
        this.usedWords = new Set();
        this.gameOver = false;
        this.words = [...validWords];
        this.shuffleWords();
        this.nextWord();
    }
    shuffleWords() {
        this.words.sort(() => Math.random() - 0.5);
    }
    nextWord() {
        const next = this.words.find(w => !this.usedWords.has(w.word.toLowerCase()));
        if (next) {
            this.currentWordObj = next;
            this.usedWords.add(next.word.toLowerCase());
            this.players.forEach(player => {
                player.triedWords = new Set();
                player.attempts = 0;
            });
        }
        else {
            this.currentWordObj = null;
        }
    }
    addPlayer(playerId, name, ws) {
        this.players.set(playerId, {
            name,
            score: 0,
            ws,
            triedWords: new Set(),
            attempts: 0
        });
    }
    removePlayer(playerId) {
        this.players.delete(playerId);
    }
    playWord(playerId, word) {
        if (this.gameOver) {
            return { success: true, message: 'O jogo já acabou. Espere a revanche.' };
        }
        const player = this.players.get(playerId);
        if (!player || !this.currentWordObj) {
            return { success: false, message: 'Jogador ou palavra inválida.' };
        }
        const lowerWord = word.toLowerCase();
        if (player.triedWords.has(lowerWord)) {
            return { success: false, message: 'palavra_repetida' };
        }
        player.triedWords.add(lowerWord);
        player.attempts++;
        if (lowerWord === this.currentWordObj.word.toLowerCase()) {
            const points = player.attempts <= 5 ? 10 : 5;
            player.score += points;
            const winner = player.score >= 60 ? player.name : null;
            if (winner) {
                this.gameOver = true;
            }
            const currentWord = this.currentWordObj;
            this.nextWord();
            return {
                success: true,
                correct: true,
                word,
                playerId,
                name: player.name,
                score: player.score,
                points,
                attempts: player.attempts,
                winner,
                nextRound: this.currentWordObj ?? undefined
            };
        }
        else {
            return {
                success: true,
                correct: false,
                message: 'Palavra incorreta. Tente novamente.',
                attempts: player.attempts
            };
        }
    }
    getScoreboard() {
        const scoreboard = Array.from(this.players.entries()).map(([id, p]) => ({
            playerId: id,
            name: p.name,
            score: p.score
        }));
        return scoreboard.sort((a, b) => b.score - a.score);
    }
    startNewRound() {
        this.nextWord();
    }
    addWord(newWordObj) {
        const wordLower = newWordObj.word.toLowerCase();
        const existsInWords = this.words.some(w => w.word.toLowerCase() === wordLower);
        if (existsInWords)
            throw new Error('A palavra já existe na lista.');
        if (this.usedWords.has(wordLower))
            throw new Error('A palavra já foi usada anteriormente.');
        this.words.push(newWordObj);
        this.shuffleWords();
    }
    resetGame() {
        this.players.forEach(player => {
            player.score = 0;
            player.triedWords = new Set();
            player.attempts = 0;
        });
        this.usedWords.clear();
        this.gameOver = false;
        this.shuffleWords();
        this.nextWord();
    }
    getAllWords() {
        return this.words;
    }
    removeWord(wordToRemove) {
        const index = this.words.findIndex(w => w.word.toLowerCase() === wordToRemove.toLowerCase());
        if (index !== -1) {
            this.words.splice(index, 1);
        }
        else {
            throw new Error("Palavra não encontrada.");
        }
    }
    getPlayersCount() {
        return this.players.size;
    }
}
exports.Game = Game;
