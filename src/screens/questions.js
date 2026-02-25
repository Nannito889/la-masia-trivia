export function renderQuestions(container, { navigate, showToast }) {
  import('../config.js').then(({ API_URL }) => {
    let questions = [];
    let editingId = null;

    container.innerHTML = `
    <div class="card card-xl">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h1 class="section-title">📝 Gestionar Preguntas</h1>
          <p class="subtitle" style="font-size: 0.85rem" id="question-count">Cargando...</p>
        </div>
        <div class="flex gap-1">
          <button id="btn-add" class="btn btn-primary btn-sm">+ Agregar</button>
          <button id="btn-back" class="btn btn-secondary btn-sm">← Volver</button>
        </div>
      </div>
      <div id="question-list" class="question-list"></div>
      <div id="modal-root"></div>
    </div>
  `;

    async function loadQuestions() {
      try {
        const res = await fetch(`${API_URL}/questions`);
        questions = await res.json();
        renderList();
      } catch (err) {
        showToast('Error al cargar preguntas', 'error');
      }
    }

    function renderList() {
      const listEl = container.querySelector('#question-list');
      const countEl = container.querySelector('#question-count');
      countEl.textContent = `${questions.length} pregunta${questions.length !== 1 ? 's' : ''} guardada${questions.length !== 1 ? 's' : ''}`;

      if (questions.length === 0) {
        listEl.innerHTML = `
        <div class="text-center" style="padding: 40px 20px; color: var(--text-muted)">
          <div style="font-size: 3rem; margin-bottom: 12px">🤔</div>
          <p>No hay preguntas todavía.</p>
          <p style="font-size: 0.85rem; margin-top: 4px">¡Agregá algunas para jugar!</p>
        </div>
      `;
        return;
      }

      listEl.innerHTML = questions.map((q, i) => `
      <div class="question-item" data-id="${q.id}">
        <span style="color: var(--text-muted); font-weight: 700; font-size: 0.8rem; min-width: 28px">${i + 1}</span>
        <span class="question-item-text" title="${escapeHtml(q.text)}">${escapeHtml(q.text)}</span>
        <div class="question-item-actions">
          <button class="btn btn-secondary btn-sm btn-edit" data-id="${q.id}" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${q.id}" title="Eliminar">🗑️</button>
        </div>
      </div>
    `).join('');

      // Edit buttons
      listEl.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = questions.find(q => q.id == btn.dataset.id);
          if (q) openModal(q);
        });
      });

      // Delete buttons
      listEl.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          try {
            await fetch(`${API_URL}/questions/${id}`, { method: 'DELETE' });
            showToast('Pregunta eliminada');
            loadQuestions();
          } catch (err) {
            showToast('Error al eliminar', 'error');
          }
        });
      });
    }

    function openModal(question = null) {
      editingId = question ? question.id : null;
      const modalRoot = container.querySelector('#modal-root');

      modalRoot.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal">
          <div class="modal-title">${question ? '✏️ Editar Pregunta' : '➕ Nueva Pregunta'}</div>
          <form class="modal-form" id="question-form">
            <div class="input-group">
              <label for="q-text">Pregunta</label>
              <input type="text" id="q-text" class="input" placeholder="¿Cuál es la capital de...?" 
                     value="${question ? escapeHtml(question.text) : ''}" required autocomplete="off">
            </div>
            <div class="input-group">
              <label>Opción A</label>
              <input type="text" id="q-a" class="input" placeholder="Respuesta A" 
                     value="${question ? escapeHtml(question.option_a) : ''}" required autocomplete="off"
                     style="border-left: 3px solid var(--option-a)">
            </div>
            <div class="input-group">
              <label>Opción B</label>
              <input type="text" id="q-b" class="input" placeholder="Respuesta B" 
                     value="${question ? escapeHtml(question.option_b) : ''}" required autocomplete="off"
                     style="border-left: 3px solid var(--option-b)">
            </div>
            <div class="input-group">
              <label>Opción C</label>
              <input type="text" id="q-c" class="input" placeholder="Respuesta C" 
                     value="${question ? escapeHtml(question.option_c) : ''}" required autocomplete="off"
                     style="border-left: 3px solid var(--option-c)">
            </div>
            <div class="input-group">
              <label>Opción D</label>
              <input type="text" id="q-d" class="input" placeholder="Respuesta D" 
                     value="${question ? escapeHtml(question.option_d) : ''}" required autocomplete="off"
                     style="border-left: 3px solid var(--option-d)">
            </div>
            <div class="input-group">
              <label>Respuesta Correcta</label>
              <div class="correct-option-group">
                ${['a', 'b', 'c', 'd'].map(opt => `
                  <div class="correct-option-radio">
                    <input type="radio" name="correct" id="correct-${opt}" value="${opt}"
                           ${question && question.correct_option === opt ? 'checked' : ''}>
                    <label for="correct-${opt}">${opt.toUpperCase()}</label>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">${question ? 'Guardar' : 'Agregar'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

      // Close modal
      modalRoot.querySelector('#btn-cancel').addEventListener('click', closeModal);
      modalRoot.querySelector('#modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
      });

      // Submit form
      modalRoot.querySelector('#question-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
          text: modalRoot.querySelector('#q-text').value.trim(),
          option_a: modalRoot.querySelector('#q-a').value.trim(),
          option_b: modalRoot.querySelector('#q-b').value.trim(),
          option_c: modalRoot.querySelector('#q-c').value.trim(),
          option_d: modalRoot.querySelector('#q-d').value.trim(),
          correct_option: modalRoot.querySelector('input[name="correct"]:checked')?.value
        };

        if (!formData.text || !formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
          return showToast('Completá todos los campos', 'error');
        }
        if (!formData.correct_option) {
          return showToast('Seleccioná la respuesta correcta', 'error');
        }

        try {
          const url = editingId ? `${API_URL}/questions/${editingId}` : `${API_URL}/questions`;
          const method = editingId ? 'PUT' : 'POST';
          await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          showToast(editingId ? 'Pregunta actualizada ✅' : 'Pregunta agregada ✅');
          closeModal();
          loadQuestions();
        } catch (err) {
          showToast('Error al guardar', 'error');
        }
      });

      // Focus first input
      setTimeout(() => modalRoot.querySelector('#q-text').focus(), 100);
    }

    function closeModal() {
      const modalRoot = container.querySelector('#modal-root');
      modalRoot.innerHTML = '';
      editingId = null;
    }

    // Event listeners
    container.querySelector('#btn-add').addEventListener('click', () => openModal());
    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));

    // Initial load
    loadQuestions();
  });
}


function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
