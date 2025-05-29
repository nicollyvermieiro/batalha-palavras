# Documentação do WebSocket da API - Jogo "Batalha de Palavras"

## Mensagens WebSocket

### 1. Evento: `joinGame`

- **Descrição:** Cliente solicita entrar no jogo.
- **Envio (cliente → servidor):**
  ```json
  {
    "playerName": "NomeDoJogador"
  }
