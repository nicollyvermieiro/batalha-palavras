"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameService = __importStar(require("../game/game.service"));
const router = (0, express_1.Router)();
router.get('/palavra-atual', (req, res) => {
    try {
        const palavraAtual = gameService.getPalavraAtual();
        res.json(palavraAtual);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao obter a palavra atual' });
    }
});
router.post('/nova-palavra', (req, res) => {
    const { palavra, dica } = req.body;
    if (!palavra || !dica) {
        return res.status(400).json({ error: 'Palavra e dica são obrigatórias' });
    }
    try {
        gameService.definirNovaPalavra(palavra, dica);
        res.json({ message: 'Nova palavra definida com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Erro ao definir nova palavra' });
    }
});
router.get('/palavras', (req, res) => {
    try {
        const todasPalavras = gameService.getTodasPalavras();
        res.json(todasPalavras);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao obter lista de palavras' });
    }
});
router.delete('/palavras/:palavra', (req, res) => {
    const palavra = req.params.palavra;
    try {
        gameService.removerPalavra(palavra);
        res.json({ message: `Palavra "${palavra}" removida com sucesso.` });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao remover palavra' });
    }
});
router.post('/iniciar-rodada', (req, res) => {
    try {
        gameService.iniciarNovaRodada();
        res.json({ message: 'Nova rodada iniciada com sucesso.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao iniciar nova rodada' });
    }
});
router.get('/placar', (req, res) => {
    try {
        const placar = gameService.getPlacar();
        res.json(placar);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao obter o placar' });
    }
});
exports.default = router;
