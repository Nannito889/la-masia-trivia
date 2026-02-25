export function renderLogin(container, { navigate, state, showToast }) {
  import('../config.js').then(({ API_URL }) => {
    container.innerHTML = `
    <div class="card card-lg text-center">
      <div class="mb-3">
        <div class="title">La Masia 🔥</div>
        <p class="subtitle mt-1">Iniciá sesión para jugar</p>
      </div>

      <form id="login-form" class="flex flex-col gap-2">
        <div class="input-group">
          <label for="login-user">Usuario</label>
          <input type="text" id="login-user" class="input" placeholder="Tu usuario..." 
                 autocomplete="username" autocapitalize="off" required>
        </div>

        <div class="input-group">
          <label for="login-pass">Contraseña</label>
          <input type="password" id="login-pass" class="input" placeholder="Tu contraseña..." 
                 autocomplete="current-password" required>
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="btn-login">
          🔑 Entrar
        </button>

        <div id="login-error" class="mt-1" style="color: var(--incorrect); font-size: 0.9rem; display: none"></div>
      </form>
    </div>
  `;

    const form = container.querySelector('#login-form');
    const userInput = container.querySelector('#login-user');
    const passInput = container.querySelector('#login-pass');
    const errorEl = container.querySelector('#login-error');
    const btn = container.querySelector('#btn-login');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = userInput.value.trim();
      const password = passInput.value;

      if (!username || !password) return;

      btn.disabled = true;
      btn.textContent = '⏳ Entrando...';
      errorEl.style.display = 'none';

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
          errorEl.textContent = data.error || 'Error al iniciar sesión';
          errorEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = '🔑 Entrar';
          return;
        }

        // Save user
        state.user = data;
        localStorage.setItem('trivia-user', JSON.stringify(data));
        showToast(`¡Bienvenido, ${data.displayName}! 🎉`);
        navigate('dashboard');
      } catch (err) {
        errorEl.textContent = 'Error de conexión';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '🔑 Entrar';
      }
    });

    userInput.focus();
  });
}
