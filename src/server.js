const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

wss.on('connection', (ws) => {
  console.log('Jogador conectado');

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);

    // Envia a mensagem para todos os jogadores conectados (broadcast)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Jogador desconectado');
  });
});

// Servidor ouvindo na porta 3000
server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
