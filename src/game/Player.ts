class Player {
    constructor(id, name, ws) {
      this.id = id;
      this.name = name;
      this.ws = ws; // WebSocket do jogador
      this.score = 0;
    }
  }
  
  module.exports = Player;
  