# Documentação das Rotas HTTP da API - Jogo "Batalha de Palavras"

## Rotas

### 1. GET `/api/palavra-atual`

- **Descrição:** Retorna a palavra atual do jogo (a ser adivinhada).
- **Parâmetros:** Nenhum
- **Resposta (200 OK):**
  ```json
  {
    "palavra": "exemplo",
    "dica": "uma dica para a palavra"
  }

- **Erros possíveis:** 500 Internal Server Error: Erro ao obter a palavra atual

### 2. POST /api/nova-palavra
- **Descrição:** Define uma nova palavra para o jogo, junto com sua dica.
- **Parâmetros (JSON no corpo):**
    ```json
    {
    "palavra": "novaPalavra",
    "dica": "dica para a palavra"
    }
- **Resposta (200 OK):**
    ```json
    {
        "message": "Nova palavra definida com sucesso!"
    }
- **Erros possíveis:**
400 Bad Request: Caso palavra ou dica estejam ausentes

500 Internal Server Error: Erro ao definir nova palavra

### GET /api/palavras
- **Descrição:** Retorna todas as palavras cadastradas no sistema (com suas dicas).
- **Parâmetros:** Nenhum
- **Resposta(200 OK):**
    ```json
    [
        { "palavra": "exemplo", "dica": "uma dica" },
        { "palavra": "teste", "dica": "outra dica" }
    ]

- **Erros possíveis:** 500 Internal Server Error: Erro ao obter lista de palavras

### DELETE /api/palavras/:palavra
- **Descrição:** Remove uma palavra específica do banco (parâmetro na URL).

- **Parâmetros na URL:** palavra (string) — a palavra a ser removida

- **Resposta (200 OK):**
    ```json
    {
    "message": "Palavra \"exemplo\" removida com sucesso."
    }

- **Erros possíveis:** 500 Internal Server Error: Erro ao remover palavra

### POST /api/iniciar-rodada
- **Descrição:** Inicia uma nova rodada no jogo, escolhendo uma nova palavra para adivinhar.
- **Parâmetros:** Nenhum
- **Resposta (200 OK):**
    ```json
    {
    "message": "Nova rodada iniciada com sucesso."
    }

- **Erros possíveis:** 500 Internal Server Error: Erro ao iniciar nova rodada

### GET /api/placar
- **Descrição:** Retorna o placar atual dos jogadores.
- **Parâmetros:** Nenhum
- **Resposta (200 OK):**
    ```json
    [
    { "name": "Jogador1", "score": 30 },
    { "name": "Jogador2", "score": 25 }
    ]

- **Erros possíveis:** 500 Internal Server Error: Erro ao obter o placar