import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import questionsRouter from './routes/questions.js';
import authRouter from './routes/auth.js';
import gameRouter from './routes/game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/game', gameRouter);

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🎮 Trivia server running on http://localhost:${PORT}`);
});
