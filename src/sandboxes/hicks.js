import { Trial } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('hicks-law');
  let roundTimes = [];
  const rounds = [4, 12, 30];
  let currentRound = 0;
  let startTime = 0;
  let targetTitle = '';

  const movies = [
    'Superbad 🍿', 'The Hangover 🍺', 'Step Brothers 🛋️', 'Jump Street 🚓',
    'Anchorman 🎙️', 'Dumb & Dumber 🚗', 'Zoolander 🕶️', 'Tropic Thunder 🎬',
    'Ghostbusters 👻', 'Ferris Bueller 🏫', 'Groundhog Day ⏰', 'Mean Girls 👗',
    'The Mask 🎭', 'School of Rock 🎸', 'Shaun of the Dead 🧟', 'Hot Fuzz 👮',
    'Napoleon Dynamite 🥔', 'Borat 🎙️', 'Clerks ☕', 'Office Space 🖨️',
    'Happy Gilmore ⛳', 'Big Lebowski 🎳', 'Dazed & Confused ✌️', 'Austin Powers 🕵️',
    'Pitch Perfect 🎤', 'Game Night 🎲', 'Booksmart 📚', 'Palm Springs 🌴',
    'Free Guy 🎮', 'Chef 🍔'
  ];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="grid"></i> Hick's Law Choice Reaction Experiment</h3>
    <p class="sandbox-desc">Pick the requested movie across 3 rounds with 4, 12, and 30 choices. Notice decision time scaling logarithmically with option count: <code>T = b log₂(n + 1)</code>.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="hicks-progress" style="width:100%; display:flex; justify-content:space-between; font-size:13px; color:#aaa;">
        <span>Round <strong id="hicks-round-num" style="color:#ffaa00">1</strong> of 3</span>
        <span id="hicks-status" style="color:#46d369">Click 'Start Round'</span>
      </div>

      <div id="hicks-prompt" style="font-size:16px; font-weight:700; color:#fff; margin:12px 0; text-align:center;">
        Target: <span id="hicks-target-name" style="color:#e50914;">---</span>
      </div>

      <div id="hicks-grid" style="width:100%; display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:8px; max-height:220px; overflow-y:auto; padding:4px;"></div>

      <div id="hicks-action-row" style="margin-top:12px;">
        <button id="hicks-start-btn" class="pill-btn" style="background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700;">Start Round 1 (4 Options)</button>
      </div>

      <div id="hicks-results" style="width:100%;"></div>
    </div>
  `;

  const roundNumEl = container.querySelector('#hicks-round-num');
  const statusEl = container.querySelector('#hicks-status');
  const targetNameEl = container.querySelector('#hicks-target-name');
  const gridEl = container.querySelector('#hicks-grid');
  const startBtn = container.querySelector('#hicks-start-btn');
  const resultsEl = container.querySelector('#hicks-results');

  function runRound() {
    const count = rounds[currentRound];
    const available = movies.slice(0, count);
    targetTitle = available[Math.floor(Math.random() * available.length)];
    targetNameEl.textContent = targetTitle;

    gridEl.innerHTML = '';
    // Shuffle display order
    const shuffled = [...available].sort(() => Math.random() - 0.5);

    shuffled.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.style.cssText = 'padding:10px 6px; font-size:12px; text-align:center; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; width:100%;';
      btn.textContent = m;

      btn.onclick = () => {
        if (!startTime) return;
        if (m === targetTitle) {
          const elapsed = Math.round(performance.now() - startTime);
          startTime = 0;
          roundTimes.push({ count, elapsed });
          statusEl.textContent = `Found in ${elapsed}ms!`;

          currentRound++;
          if (currentRound < rounds.length) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = `Start Round ${currentRound + 1} (${rounds[currentRound]} Options)`;
            gridEl.innerHTML = '';
            targetNameEl.textContent = '---';
          } else {
            finishExperiment();
          }
        } else {
          statusEl.textContent = 'Wrong tile! Keep looking...';
          statusEl.style.color = '#e50914';
        }
      };
      gridEl.appendChild(btn);
    });

    startBtn.style.display = 'none';
    statusEl.textContent = 'Find and click the movie!';
    statusEl.style.color = '#ffaa00';
    startTime = performance.now();
  }

  startBtn.onclick = () => {
    roundNumEl.textContent = currentRound + 1;
    runRound();
  };

  function finishExperiment() {
    gridEl.style.display = 'none';
    startBtn.style.display = 'none';

    const ratio = (roundTimes[2].elapsed / Math.max(1, roundTimes[0].elapsed)).toFixed(1);
    
    resultsEl.innerHTML = `<h4 style="color:#fff; margin:16px 0 8px; font-size:14px;">Reaction Time by Option Density</h4>`;

    renderBarChart(resultsEl, {
      labels: ['4 Options', '12 Options', '30 Options'],
      values: roundTimes.map(r => r.elapsed),
      title: 'Time to Pick Target (ms)',
      yLabel: 'ms'
    });

    trial.save({ roundTimes, ratio });

    Trial.renderResultCard(resultsEl, {
      yours: `30 options took ${ratio}× longer than 4 options (${roundTimes[2].elapsed}ms vs ${roundTimes[0].elapsed}ms)`,
      benchmark: `2.0× - 2.8× logarithmic scaling`,
      rule: `Decision time increases logarithmically with the number and complexity of choices.`
    });
  }

  return () => trial.cleanup();
}
