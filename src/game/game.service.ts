import { Game } from '../game/Game';
import wordsData from '../../data/words.json';

const game = new Game(wordsData);

export function getPalavraAtual() {
  if (!game.currentWordObj) {
    game.startNewRound();
  }
  const currentWord = game.currentWordObj;
  if (!currentWord) return null;
  return {
    hint: currentWord.hint,
    length: currentWord.word.length,
  };
}

export function definirNovaPalavra(palavra: string, dica: string) {
  try {
    game.addWord({ word: palavra, hint: dica });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export { game };
