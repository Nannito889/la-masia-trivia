import { Router } from 'express';

const router = Router();

// Hardcoded users
const USERS = [
    { username: 'ignn', password: 'Recuerda.333', displayName: 'Ignn' },
    { username: 'gusp', password: 'Hola1234', displayName: 'Gusp' },
    { username: 'benf', password: 'dadada', displayName: 'Benf' }
];

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    res.json({ username: user.username, displayName: user.displayName });
});

// Verify user (simple check)
router.get('/verify', (req, res) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    const user = USERS.find(u => u.username === username.toLowerCase());
    if (!user) {
        return res.status(401).json({ error: 'Usuario no válido' });
    }
    res.json({ username: user.username, displayName: user.displayName });
});

export default router;
