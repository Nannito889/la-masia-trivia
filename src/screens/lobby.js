export function renderLobby(container, { state, socket, navigate }) {
    container.innerHTML = `
    <div class="card card-lg text-center">
      <div class="mb-2">
        <p class="subtitle mb-1">Código de la sala</p>
        <div class="room-code" id="room-code">${state.roomCode}</div>
        <button class="btn btn-secondary btn-sm mt-1" id="btn-copy">📋 Copiar código</button>
      </div>

      <div class="mb-2">
        <p class="subtitle mb-1">Jugadores conectados (${state.players.length})</p>
        <ul class="player-list" style="justify-content: center" id="player-list">
          ${state.players.map(p => `
            <li class="player-tag">
              <span class="player-avatar">${p.name.charAt(0).toUpperCase()}</span>
              ${escapeHtml(p.name)}${p.id === state.players[0]?.id ? ' 👑' : ''}
            </li>
          `).join('')}
        </ul>
      </div>

      ${state.isHost ? `
        <div class="flex flex-col gap-1 mt-3">
          <button id="btn-start" class="btn btn-primary btn-lg w-full" ${state.players.length < 1 ? 'disabled' : ''}>
            🚀 Iniciar Juego
          </button>
          <p class="subtitle" style="font-size: 0.8rem; margin-top: 4px">
            Esperando jugadores<span class="waiting-dots"></span>
          </p>
        </div>
      ` : `
        <div class="mt-3 text-center">
          <p class="subtitle">Esperando que el host inicie el juego<span class="waiting-dots"></span></p>
        </div>
      `}

      <button class="btn btn-secondary btn-sm mt-3" id="btn-leave">🚪 Salir de la sala</button>
    </div>
  `;

    // Copy code
    container.querySelector('#btn-copy').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(state.roomCode);
            container.querySelector('#btn-copy').textContent = '✅ Copiado!';
            setTimeout(() => {
                const btn = container.querySelector('#btn-copy');
                if (btn) btn.textContent = '📋 Copiar código';
            }, 2000);
        } catch {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = state.roomCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            container.querySelector('#btn-copy').textContent = '✅ Copiado!';
        }
    });

    // Start game
    if (state.isHost) {
        container.querySelector('#btn-start').addEventListener('click', () => {
            socket.emit('start-game');
        });
    }

    // Leave room
    container.querySelector('#btn-leave').addEventListener('click', () => {
        socket.disconnect();
        socket.connect();
        state.roomCode = null;
        state.isHost = false;
        state.players = [];
        navigate('home');
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
