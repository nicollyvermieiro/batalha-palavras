export class Game {
  public players: Map<string, any> = new Map();
  private words: { word: string; hint: string }[] = [];
  public currentWordObj: { word: string; hint: string } | null = null;
  private usedWords: Set<string> = new Set();
  public gameOver: boolean = false;

  constructor(validWords: { word: string; hint: string }[]) {
    this.words = [...validWords];
    this.shuffleWords();
    this.nextWord();
  }

  private shuffleWords() {
    this.words.sort(() => Math.random() - 0.5);
  }

  private nextWord() {
    const next = this.words.find(w => !this.usedWords.has(w.word.toLowerCase()));
    if (next) {
      this.currentWordObj = next;
      this.usedWords.add(next.word.toLowerCase());
      this.players.forEach(player => {
        player.triedWords = new Set<string>();
        player.attempts = 0;
      });
    } else {
      this.currentWordObj = null;
    }
  }

  addPlayer(playerId: string, name: string, ws: any) {
    this.players.set(playerId, {
      name,
      score: 0,
      ws,
      triedWords: new Set<string>(),
      attempts: 0
    });
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  playWord(playerId: string, word: string) {
    if (this.gameOver) {
      return { success: false, message: 'O jogo já acabou. Espere a revanche.' };
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
    } else {
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

  public startNewRound() {
    this.nextWord();
  }

  getPlayersCount() {
    return this.players.size;
  }

  public addWord(newWordObj: { word: string; hint: string }) {
    const wordLower = newWordObj.word.toLowerCase();

    const existsInWords = this.words.some(w => w.word.toLowerCase() === wordLower);
    if (existsInWords) {
      throw new Error('A palavra já existe na lista.');
    }

    if (this.usedWords.has(wordLower)) {
      throw new Error('A palavra já foi usada anteriormente.');
    }

    this.words.push(newWordObj);
    this.shuffleWords();
  }

  public resetGame() {
    this.players.forEach(player => {
      player.score = 0;
      player.triedWords = new Set<string>();
      player.attempts = 0;
    });

    this.usedWords.clear();
    this.gameOver = false; // <- RESET DO FIM DE JOGO
    this.shuffleWords();
    this.nextWord();
  }
}
