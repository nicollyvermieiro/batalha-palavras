import { Router, Request, Response } from 'express';
import * as gameService from '../game/game.service';

const router = Router();

router.get('/palavra-atual', (req: Request, res: Response) => {
  try {
    const palavraAtual = gameService.getPalavraAtual();
    res.json(palavraAtual);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter a palavra atual' });
  }
});

router.post('/nova-palavra', (req: Request, res: Response) => {
  const { palavra, dica } = req.body;
  if (!palavra || !dica) {
    return res.status(400).json({ error: 'Palavra e dica são obrigatórias' });
  }
  try {
    gameService.definirNovaPalavra(palavra, dica);
    res.json({ message: 'Nova palavra definida com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao definir nova palavra' });
  }
});

export default router;
