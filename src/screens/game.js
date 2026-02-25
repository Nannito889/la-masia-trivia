export function renderGame(container, { state, navigate, showToast, gameData }) {
  import('../config.js').then(({ API_URL }) => {
    let currentIndex = 0;
    let score = 0;
    let correctCount = 0;
    let streak = 0;
    let timerInterval = null;
    let timeLeft = 20;
    let hasAnswered = false;

    const { gameToken, questions, totalQuestions } = gameData;

    container.innerHTML = `
    <div class="card card-lg" style="max-width: 640px">
      <div id="game-content"></div>
    </div>
  `;

    const content = container.querySelector('#game-content');

    // Show countdown before starting
    showCountdown(() => renderQuestion());

    function showCountdown(callback) {
      let count = 3;
      content.innerHTML = `
      <div class="text-center" style="padding: 50px 20px">
        <p class="subtitle mb-2">¡Preparate!</p>
        <div class="countdown-number" id="countdown">${count}</div>
        <p class="subtitle mt-2" style="font-size: 0.85rem">${totalQuestions} preguntas</p>
      </div>
    `;

      const el = content.querySelector('#countdown');
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          el.textContent = count;
          el.style.animation = 'none';
          el.offsetHeight; // reflow
          el.style.animation = 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        } else {
          clearInterval(interval);
          callback();
        }
      }, 1000);
    }

    function renderQuestion() {
      if (currentIndex >= questions.length) {
        finishGame();
        return;
      }

      hasAnswered = false;
      const q = questions[currentIndex];
      timeLeft = 20;

      content.innerHTML = `
      <div class="question-header">
        <span class="question-counter">Pregunta ${currentIndex + 1} de ${totalQuestions}</span>
        <span class="question-category">${escapeHtml(q.category)}</span>
      </div>

      <div class="timer-container">
        <div class="timer-bar" id="timer-bar" style="width: 100%"></div>
      </div>
      <div class="timer-text" id="timer-text">20</div>

      <div class="question-text">${escapeHtml(q.text)}</div>

      <div class="options-grid" id="options-grid">
        ${Object.entries(q.options).map(([key, value]) => `
          <button class="option-btn" data-option="${key}" id="opt-${key}">
            <span>${escapeHtml(value)}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex justify-between items-center mt-2" style="font-size: 0.85rem; color: var(--text-secondary)">
        <span>⭐ ${score} pts</span>
        <span>${streak >= 3 ? `🔥 Racha: ${streak}` : ''}</span>
      </div>
    `;

      // Start timer
      startTimer();

      // Option click handlers
      content.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (hasAnswered) return;
          hasAnswered = true;
          clearInterval(timerInterval);

          // Disable all buttons
          content.querySelectorAll('.option-btn').forEach(b => {
            b.disabled = true;
            if (b === btn) b.classList.add('selected');
          });

          submitAnswer(btn.dataset.option);
        });
      });
    }

    function startTimer() {
      clearInterval(timerInterval);
      const start = Date.now();
      const totalMs = 20000;

      timerInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, totalMs - elapsed);
        const fraction = remaining / totalMs;
        timeLeft = Math.ceil(remaining / 1000);

        const bar = content.querySelector('#timer-bar');
        const text = content.querySelector('#timer-text');
        if (!bar || !text) { clearInterval(timerInterval); return; }

        bar.style.width = `${fraction * 100}%`;
        text.textContent = timeLeft;

        bar.className = 'timer-bar';
        text.className = 'timer-text';
        if (fraction <= 0.25) {
          bar.classList.add('danger');
          text.classList.add('danger');
        } else if (fraction <= 0.5) {
          bar.classList.add('warning');
          text.classList.add('warning');
        }

        if (remaining <= 0) {
          clearInterval(timerInterval);
          if (!hasAnswered) {
            hasAnswered = true;
            handleTimeout();
          }
        }
      }, 50);
    }

    async function submitAnswer(answer) {
      try {
        const res = await fetch(`${API_URL}/game/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameToken, questionIndex: currentIndex, answer })
        });

        const data = await res.json();
        showFeedback(data.isCorrect, data.correctOption, answer);
      } catch (err) {
        showToast('Error al enviar respuesta', 'error');
        setTimeout(() => { currentIndex++; renderQuestion(); }, 1500);
      }
    }

    function handleTimeout() {
      streak = 0;
      // Highlight all options as disabled
      content.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

      // Fetch correct answer
      fetch(`${API_URL}/game/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameToken, questionIndex: currentIndex, answer: 'timeout' })
      }).then(r => r.json()).then(data => {
        showTimeoutFeedback(data.correctOption);
      }).catch(() => {
        setTimeout(() => { currentIndex++; renderQuestion(); }, 1500);
      });
    }

    function showFeedback(isCorrect, correctOption, selectedAnswer) {
      // Show correct/incorrect
      content.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.dataset.option === correctOption) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('incorrect');
        }
      });

      let pointsEarned = 0;
      if (isCorrect) {
        correctCount++;
        streak++;
        const timeFraction = Math.max(0, timeLeft / 20);
        pointsEarned = Math.round(100 + 900 * timeFraction);
        if (streak >= 3) pointsEarned = Math.round(pointsEarned * 1.2);
        score += pointsEarned;
      } else {
        streak = 0;
      }

      // Show feedback overlay
      setTimeout(() => {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'answer-feedback';

        if (isCorrect) {
          feedbackEl.innerHTML = `
          <span class="emoji">🎉</span>
          <div class="points">+${pointsEarned} pts</div>
          ${streak >= 3 ? `<div class="streak">🔥 Racha de ${streak}! (+20% bonus)</div>` : ''}
        `;
        } else {
          feedbackEl.innerHTML = `
          <span class="emoji">😅</span>
          <div style="font-size: 1.3rem; font-weight: 700; color: var(--incorrect)">¡Incorrecto!</div>
        `;
        }

        content.appendChild(feedbackEl);
      }, 400);

      // Next question
      setTimeout(() => { currentIndex++; renderQuestion(); }, 2500);
    }

    function showTimeoutFeedback(correctOption) {
      content.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.dataset.option === correctOption) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('incorrect');
        }
      });

      setTimeout(() => {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'answer-feedback';
        feedbackEl.innerHTML = `
        <span class="emoji">⏰</span>
        <div style="font-size: 1.3rem; font-weight: 700; color: var(--text-secondary)">¡Se acabó el tiempo!</div>
      `;
        content.appendChild(feedbackEl);
      }, 400);

      setTimeout(() => { currentIndex++; renderQuestion(); }, 2500);
    }

    async function finishGame() {
      clearInterval(timerInterval);
      try {
        await fetch(`${API_URL}/game/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameToken,
            username: state.user.username,
            score,
            correctCount,
            totalQuestions
          })
        });
      } catch (err) {
        // Score saving failed, continue anyway
      }

      navigate('results', { score, correctCount, totalQuestions });
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
