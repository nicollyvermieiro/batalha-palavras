import 'dotenv/config';
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

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', gameRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

wss.on('connection', (ws) => handleConnection(ws, wss));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


