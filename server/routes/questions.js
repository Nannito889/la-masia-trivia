import { Router } from 'express';
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion } from '../db.js';

const router = Router();

// GET all questions
router.get('/', async (req, res) => {
    try {
        const questionsDb = await getAllQuestions();
        // Map Spanish columns back to English for the frontend
        const questions = questionsDb.map(q => ({
            id: q.id,
            text: q.pregunta,
            option_a: q.respuesta_a,
            option_b: q.respuesta_b,
            option_c: q.respuesta_c,
            option_d: q.respuesta_d,
            correct_option: q.respuesta_correcta.toLowerCase()
        }));
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new question
router.post('/', async (req, res) => {
    try {
        const { text, option_a, option_b, option_c, option_d, correct_option } = req.body;
        if (!text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        if (!['a', 'b', 'c', 'd'].includes(correct_option)) {
            return res.status(400).json({ error: 'correct_option debe ser a, b, c, o d' });
        }
        const question = await addQuestion({ text, option_a, option_b, option_c, option_d, correct_option });
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update question
router.put('/:id', async (req, res) => {
    try {
        const { text, option_a, option_b, option_c, option_d, correct_option } = req.body;
        if (!text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const questionDb = await updateQuestion(req.params.id, { text, option_a, option_b, option_c, option_d, correct_option });
        if (!questionDb) {
            return res.status(404).json({ error: 'Pregunta no encontrada' });
        }
        res.json({
            id: questionDb.id,
            text: questionDb.pregunta,
            option_a: questionDb.respuesta_a,
            option_b: questionDb.respuesta_b,
            option_c: questionDb.respuesta_c,
            option_d: questionDb.respuesta_d,
            correct_option: questionDb.respuesta_correcta.toLowerCase()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE question
router.delete('/:id', async (req, res) => {
    try {
        await deleteQuestion(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
