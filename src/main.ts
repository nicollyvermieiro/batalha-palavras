import express from 'express';
import http from 'http';
import path from 'path';
import * as WebSocket from 'ws';

import gameRoutes from './routes/gameRoutes';
import { handleConnection } from './services/wsService';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Servir arquivos estáticos da pasta 'public' (index.html, CSS, JS, etc)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api', gameRoutes);

// WebSocket
wss.on('connection', (ws) => handleConnection(ws, wss));

const port = 3000;
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
