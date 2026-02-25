import { renderLogin } from './screens/login.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderQuestions } from './screens/questions.js';
import { renderGame } from './screens/game.js';
import { renderResults } from './screens/results.js';

// App state
const state = {
    user: JSON.parse(localStorage.getItem('trivia-user') || 'null'),
    currentScreen: 'login'
};

const container = document.getElementById('screen-container');

// Router
function navigate(screen, data = {}) {
    state.currentScreen = screen;
    container.innerHTML = '';

    const screenDiv = document.createElement('div');
    screenDiv.className = 'screen-enter';
    container.appendChild(screenDiv);

    const ctx = { state, navigate, showToast, ...data };

    switch (screen) {
        case 'login':
            renderLogin(screenDiv, ctx);
            break;
        case 'dashboard':
            renderDashboard(screenDiv, ctx);
            break;
        case 'questions':
            renderQuestions(screenDiv, ctx);
            break;
        case 'game':
            renderGame(screenDiv, ctx);
            break;
        case 'results':
            renderResults(screenDiv, ctx);
            break;
    }
}

// Toast notifications
let toastTimeout;
function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Start
if (state.user) {
    navigate('dashboard');
} else {
    navigate('login');
}
