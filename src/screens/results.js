export function renderResults(container, { state, navigate, score = 0, correctCount = 0, totalQuestions = 0, showToast }) {
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let emoji, message;
  if (percentage >= 90) { emoji = '🏆'; message = '¡Increíble! Sos un genio!'; }
  else if (percentage >= 70) { emoji = '🎉'; message = '¡Muy bien! Gran resultado!'; }
  else if (percentage >= 50) { emoji = '👍'; message = '¡Nada mal! Podés mejorar.'; }
  else if (percentage >= 30) { emoji = '😅'; message = 'A seguir practicando...'; }
  else { emoji = '📚'; message = '¡No te rindas! Intentá de nuevo.'; }

  container.innerHTML = `
    <div class="card card-lg text-center">
      <div class="mb-3">
        <div style="font-size: 4.5rem">${emoji}</div>
        <h1 class="title" style="font-size: 2rem; margin-top: 12px">¡Partida Terminada!</h1>
        <p class="subtitle mt-1">${message}</p>
      </div>

      <div class="stats-grid mb-3">
        <div class="stat-card">
          <div class="stat-value">${score}</div>
          <div class="stat-label">Puntos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${correctCount}/${totalQuestions}</div>
          <div class="stat-label">Correctas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Precisión</div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <button id="btn-play-again" class="btn btn-primary btn-lg w-full">🔄 Jugar de Nuevo</button>
        <button id="btn-home" class="btn btn-secondary w-full">🏠 Volver al Inicio</button>
      </div>
    </div>
  `;

  // Confetti!
  launchConfetti();

  import('../config.js').then(({ API_URL }) => {
    container.querySelector('#btn-play-again').addEventListener('click', async () => {
      const btn = container.querySelector('#btn-play-again');
      btn.disabled = true;
      btn.textContent = '⏳ Preparando...';

      try {
        const res = await fetch(`${API_URL}/game/start`);
        const data = await res.json();
        if (!res.ok) {
          btn.disabled = false;
          btn.textContent = '🔄 Jugar de Nuevo';
          showToast('Error al iniciar el juego. Intenta de nuevo.', 'error');
          return;
        }
        navigate('game', { gameData: data });
      } catch (error) {
        btn.disabled = false;
        btn.textContent = '🔄 Jugar de Nuevo';
        showToast('Error de red. Verifica tu conexión.', 'error');
      }
    });

    container.querySelector('#btn-home').addEventListener('click', () => navigate('dashboard'));
  });
}

function launchConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);

  const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 1}s`;
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => confettiContainer.remove(), 5000);
}
