export function renderHome(container, { state, socket, navigate }) {
  container.innerHTML = `
    <div class="card card-lg text-center">
      <div class="mb-3">
        <div class="title">La Masia 🔥</div>
        <p class="subtitle mt-1">Jugá con tus amigos en tiempo real</p>
      </div>

      <div class="input-group mb-2">
        <label for="player-name">Tu Nombre</label>
        <input type="text" id="player-name" class="input" placeholder="Ingresá tu nombre..." 
               value="${state.playerName}" maxlength="20" autocomplete="off">
      </div>

      <div class="flex flex-col gap-1 mt-3">
        <button id="btn-create" class="btn btn-primary btn-lg w-full">
          🏠 Crear Sala
        </button>

        <div class="flex gap-1 mt-1">
          <input type="text" id="room-code-input" class="input" placeholder="Código de sala..."
                 style="flex:1; text-transform: uppercase" maxlength="5" autocomplete="off">
          <button id="btn-join" class="btn btn-secondary" style="white-space: nowrap">
            🔗 Unirse
          </button>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-glass)">
          <button id="btn-questions" class="btn btn-secondary w-full">
            📝 Gestionar Preguntas
          </button>
        </div>
      </div>
    </div>
  `;

  const nameInput = container.querySelector('#player-name');
  const codeInput = container.querySelector('#room-code-input');

  function saveName() {
    const name = nameInput.value.trim();
    if (name) {
      state.playerName = name;
      localStorage.setItem('trivia-name', name);
    }
  }

  container.querySelector('#btn-create').addEventListener('click', () => {
    saveName();
    if (!state.playerName) return nameInput.focus();
    socket.emit('create-room', { playerName: state.playerName, questionCount: 15 });
  });

  container.querySelector('#btn-join').addEventListener('click', () => {
    saveName();
    if (!state.playerName) return nameInput.focus();
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return codeInput.focus();
    socket.emit('join-room', { roomCode: code, playerName: state.playerName });
  });

  // Allow Enter key on code input
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') container.querySelector('#btn-join').click();
  });

  container.querySelector('#btn-questions').addEventListener('click', () => {
    navigate('questions');
  });

  nameInput.focus();
}
