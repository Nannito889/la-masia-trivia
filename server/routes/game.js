import { Router } from 'express';
import { getRandomQuestions, getQuestionCount } from '../db.js';

const router = Router();

// Start a new game — returns 20 random questions (without correct answers)
router.get('/start', async (req, res) => {
    try {
        const totalAvailable = await getQuestionCount();
        if (totalAvailable < 1) {
            return res.status(400).json({ error: '¡Necesitan agregar preguntas primero!' });
        }
        const count = Math.min(20, totalAvailable);
        const questions = await getRandomQuestions(count);

        // Send questions without correct answers
        const safeQuestions = questions.map((q, i) => ({
            index: i,
            id: q.id,
            text: q.pregunta,
            options: {
                a: q.respuesta_a,
                b: q.respuesta_b,
                c: q.respuesta_c,
                d: q.respuesta_d
            }
        }));

        // Store the correct answers server-side keyed by a game token
        const gameToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
        if (!global.activeGames) global.activeGames = new Map();
        global.activeGames.set(gameToken, {
            questions: questions,
            startedAt: Date.now(),
            answered: new Map()
        });

        // Clean old games (>1 hour)
        const oneHourAgo = Date.now() - 3600000;
        for (const [token, game] of global.activeGames) {
            if (game.startedAt < oneHourAgo) global.activeGames.delete(token);
        }

        res.json({ gameToken, questions: safeQuestions, totalQuestions: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Answer a question
router.post('/answer', (req, res) => {
    try {
        const { gameToken, questionIndex, answer } = req.body;
        if (!global.activeGames || !global.activeGames.has(gameToken)) {
            return res.status(400).json({ error: 'Partida no encontrada' });
        }

        const game = global.activeGames.get(gameToken);

        if (questionIndex < 0 || questionIndex >= game.questions.length) {
            return res.status(400).json({ error: 'Pregunta inválida' });
        }

        if (game.answered.has(questionIndex)) {
            return res.status(400).json({ error: 'Ya respondiste esta pregunta' });
        }

        const question = game.questions[questionIndex];
        const isCorrect = answer.toUpperCase() === question.respuesta_correcta;
        game.answered.set(questionIndex, { answer, isCorrect });

        res.json({
            isCorrect,
            correctOption: question.respuesta_correcta.toLowerCase()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Finish game and save score
router.post('/finish', (req, res) => {
    try {
        const { gameToken, username, score, correctCount, totalQuestions } = req.body;
        if (!global.activeGames || !global.activeGames.has(gameToken)) {
            return res.status(400).json({ error: 'Partida no encontrada' });
        }


        // Remove game
        global.activeGames.delete(gameToken);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
