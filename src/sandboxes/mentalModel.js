import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('mental-model');
  let correct = 0;
  let index = 0;

  const questions = [
    { icon: '💾', prompt: 'What does this icon usually mean in software?', options: ['Save', 'Delete', 'Settings'], answer: 'Save',
      note: 'A floppy disk hasn\'t been used to save anything in decades — this icon only "works" because of a learned mental model, not because it looks like what it does.' },
    { icon: '☰', prompt: 'What does this icon usually mean?', options: ['Navigation menu', 'Bulleted list', 'Alignment'], answer: 'Navigation menu',
      note: 'The "hamburger" icon is a pure convention — nothing about three lines inherently means "menu."' },
    { icon: '🔍➡️', prompt: 'A magnifying glass with a plus sign inside — what does it do?', options: ['Zoom in', 'Search for more results', 'Add a filter'], answer: 'Zoom in',
      note: 'Icon meanings shift by context: the same glass icon means "search" almost everywhere else.' },
  ];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="help-circle"></i> Mental Models: Guess the Icon</h3>
    <p class="sandbox-desc">Users interpret interfaces through their existing mental models — built from past experience, not the designer's intent. Try guessing these.</p>
    <div class="sandbox-demo-box" id="mm-box" style="min-height:220px;"></div>
  `;

  const box = container.querySelector('#mm-box');

  function renderQuestion() {
    const q = questions[index];
    box.innerHTML = `
      <div style="font-size:48px; text-align:center; margin-bottom:12px;">${q.icon}</div>
      <p style="text-align:center; color:#fff; margin-bottom:14px;">${q.prompt}</p>
      <div id="mm-options" style="display:flex; flex-direction:column; gap:8px;"></div>
      <p id="mm-feedback" style="margin-top:12px; font-size:13px; color:#aaa; display:none;"></p>
    `;
    const optsEl = box.querySelector('#mm-options');
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.textContent = opt;
      trial.addListener(btn, 'click', () => {
        const feedback = box.querySelector('#mm-feedback');
        const isCorrect = opt === q.answer;
        if (isCorrect) correct++;
        feedback.style.display = 'block';
        feedback.style.color = isCorrect ? '#46d369' : '#ff6b6b';
        feedback.textContent = (isCorrect ? '✓ Right. ' : `✗ Most people say "${q.answer}". `) + q.note;
        [...optsEl.children].forEach(b => b.disabled = true);
        trial.setTimeout(next, 2200);
      });
      optsEl.appendChild(btn);
    });
  }

  function next() {
    index++;
    if (index >= questions.length) finish();
    else renderQuestion();
  }

  function finish() {
    box.innerHTML = `<h4 style="color:#46d369;">You got ${correct}/${questions.length} matching the common expectation.</h4>`;
    trial.save({ correct, total: questions.length });
    Trial.renderResultCard(box, {
      yours: `${correct}/${questions.length} matched the conventional model`,
      benchmark: 'Designers who rely on novel icons without labels often see much lower recognition rates than they expect',
      rule: 'Interfaces succeed when they match the mental model users already have — not the one the designer intended.'
    });
  }

  renderQuestion();
  return () => trial.cleanup();
}
