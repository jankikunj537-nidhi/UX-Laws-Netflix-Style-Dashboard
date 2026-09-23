import { Trial, confettiBurst } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('goal-gradient-effect');
  const TOTAL = 10;
  let stamps = 0;
  const clickTimes = [];
  let lastClick = null;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="award"></i> Goal-Gradient Effect: Loyalty Card</h3>
    <p class="sandbox-desc">Click "Add Stamp" to fill your loyalty card. We're timing the gap between your clicks as you approach the free reward.</p>
    <div class="sandbox-demo-box" id="goal-box" style="min-height:220px;">
      <div id="goal-cards" style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-bottom:16px;"></div>
      <button class="pill-btn" id="goal-stamp-btn" style="width:100%; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:12px;">Add Stamp</button>
      <div id="goal-results" style="margin-top:16px;"></div>
    </div>
  `;

  const cardsEl = container.querySelector('#goal-cards');
  const stampBtn = container.querySelector('#goal-stamp-btn');
  const resultsEl = container.querySelector('#goal-results');

  function renderCard() {
    cardsEl.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = `aspect-ratio:1; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px dashed rgba(255,255,255,0.2);`;
      if (i < stamps) {
        cell.style.background = 'var(--netflix-red)';
        cell.style.border = '2px solid var(--netflix-red)';
        cell.textContent = '★';
      }
      cardsEl.appendChild(cell);
    }
  }
  renderCard();

  trial.addListener(stampBtn, 'click', () => {
    const now = performance.now();
    if (lastClick !== null) clickTimes.push(Math.round(now - lastClick));
    lastClick = now;
    stamps = Math.min(TOTAL, stamps + 1);
    renderCard();

    if (stamps === TOTAL) {
      stampBtn.disabled = true;
      stampBtn.textContent = '🎉 Reward Unlocked!';
      confettiBurst(container.querySelector('#goal-box'), 40);
      finish();
    }
  });

  function finish() {
    resultsEl.innerHTML = `<h4 style="color:#46d369; margin-bottom:8px;">Time between each stamp click:</h4>`;
    renderBarChart(resultsEl, {
      labels: clickTimes.map((_, i) => `${i + 1}→${i + 2}`),
      values: clickTimes,
      title: 'Gap Between Clicks (ms)',
      yLabel: 'ms'
    });
    trial.save({ clickTimes });
    Trial.renderResultCard(resultsEl, {
      yours: clickTimes.length > 1
        ? (clickTimes[clickTimes.length - 1] < clickTimes[0] ? 'You sped up as you approached the goal' : 'Your pace stayed fairly steady')
        : 'Not enough clicks to compare',
      benchmark: 'People typically click/act faster the closer they get to completing a goal (e.g. loyalty cards, progress bars)',
      rule: 'Motivation to reach a goal increases as the perceived distance to it decreases.'
    });
  }

  return () => trial.cleanup();
}
