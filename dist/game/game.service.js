"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
exports.getPalavraAtual = getPalavraAtual;
exports.definirNovaPalavra = definirNovaPalavra;
exports.getTodasPalavras = getTodasPalavras;
exports.removerPalavra = removerPalavra;
exports.iniciarNovaRodada = iniciarNovaRodada;
exports.getPlacar = getPlacar;
const Game_1 = require("../game/Game");
const words_json_1 = __importDefault(require("../../data/words.json"));
const game = new Game_1.Game(words_json_1.default);
exports.game = game;
function getPalavraAtual() {
    if (!game.currentWordObj) {
        game.startNewRound();
    }
    const currentWord = game.currentWordObj;
    if (!currentWord)
        return null;
    return {
        hint: currentWord.hint,
        length: currentWord.word.length,
    };
}
function definirNovaPalavra(palavra, dica) {
    try {
        game.addWord({ word: palavra, hint: dica });
    }
    catch (error) {
        throw new Error(error.message);
    }
}
function getTodasPalavras() {
    return game.getAllWords(); // você deve implementar esse método no Game
}
function removerPalavra(palavra) {
    game.removeWord(palavra);
}
function iniciarNovaRodada() {
    game.startNewRound();
}
function getPlacar() {
    return game.getScoreboard();
}
