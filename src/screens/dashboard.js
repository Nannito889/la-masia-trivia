export function renderDashboard(container, { state, navigate, showToast }) {
  import('../config.js').then(({ API_URL }) => {
    container.innerHTML = `
      <div class="card card-lg text-center">
        <div class="mb-3">
          <div class="title" style="font-size: 2rem">La Masia 🔥</div>
          <p class="subtitle mt-1">Hola, <strong style="color: var(--accent-1)">${escapeHtml(state.user?.displayName || 'Jugador')}</strong> 👋</p>
        </div>
        <div class="flex flex-col gap-1">
        <button id="btn-play" class="btn btn-primary btn-lg w-full">
          🚀 Jugar Trivia
        </button>

        <button id="btn-questions" class="btn btn-secondary btn-lg w-full">
          📝 Gestionar Preguntas
        </button>
      </div>

      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border-glass)">
        <button id="btn-logout" class="btn btn-danger btn-sm">
          🚪 Cerrar Sesión
        </button>
      </div>
    </div >
    `;

    container.querySelector('#btn-play').addEventListener('click', async () => {
      const btn = container.querySelector('#btn-play');
      btn.disabled = true;
      btn.textContent = '⏳ Preparando...';

      try {
        const res = await fetch(`${API_URL}/game/start`);
        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || 'Error al iniciar', 'error');
          btn.disabled = false;
          btn.textContent = '🚀 Jugar Trivia';
          return;
        }

        navigate('game', { gameData: data });
      } catch (err) {
        showToast('Error de conexión', 'error');
        btn.disabled = false;
        btn.textContent = '🚀 Jugar Trivia';
      }
    });

    container.querySelector('#btn-questions').addEventListener('click', () => {
      navigate('questions');
    });

    container.querySelector('#btn-logout').addEventListener('click', () => {
      state.user = null;
      localStorage.removeItem('trivia-user');
      navigate('login');
      showToast('Sesión cerrada');
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
