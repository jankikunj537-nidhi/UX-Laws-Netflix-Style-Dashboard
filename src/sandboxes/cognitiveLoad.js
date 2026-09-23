import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('cognitive-load');
  const results = {};

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="layers"></i> Cognitive Load: Find the Button</h3>
    <p class="sandbox-desc">Same task, two interfaces. Find and click the "Confirm" button as fast as you can.</p>
    <div class="sandbox-demo-box" id="load-box" style="min-height:260px;"></div>
  `;

  const box = container.querySelector('#load-box');
  const noiseLabels = ['Options', 'Preferences', 'Details', 'Advanced', 'Settings', 'Continue', 'Skip', 'More Info', 'Cancel', 'Review', 'Notify', 'Export'];

  function runRound(cluttered, key, onDone) {
    if (cluttered) {
      const buttons = [...noiseLabels].sort(() => Math.random() - 0.5).slice(0, 11);
      const insertAt = Math.floor(Math.random() * (buttons.length + 1));
      buttons.splice(insertAt, 0, 'Confirm');
      box.innerHTML = `
        <p style="color:#ffaa00; font-size:13px; margin-bottom:10px;">Cluttered UI — click "Confirm":</p>
        <div id="load-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;"></div>
      `;
      const grid = box.querySelector('#load-grid');
      buttons.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'pill-btn';
        btn.style.fontSize = '11px';
        btn.textContent = label;
        if (label === 'Confirm') {
          trial.addListener(btn, 'click', () => { results[key] = trial.elapsed(); onDone(); });
        } else {
          trial.addListener(btn, 'click', () => { btn.style.opacity = '0.4'; });
        }
        grid.appendChild(btn);
      });
    } else {
      box.innerHTML = `
        <p style="color:#ffaa00; font-size:13px; margin-bottom:16px;">Clean UI — click "Confirm":</p>
        <div style="display:flex; align-items:center; justify-content:center; height:150px;">
          <button class="pill-btn" id="load-clean-btn" style="background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:14px 32px; font-size:15px;">Confirm</button>
        </div>
      `;
      const btn = box.querySelector('#load-clean-btn');
      trial.addListener(btn, 'click', () => { results[key] = trial.elapsed(); onDone(); });
    }
    trial.start();
  }

  runRound(true, 'cluttered', () => runRound(false, 'clean', finish));

  function finish() {
    box.innerHTML = `<h4 style="color:#46d369;">Time to find "Confirm":</h4><div id="load-results"></div>`;
    const resultsEl = box.querySelector('#load-results');
    renderComparisonBars(resultsEl, {
      labelA: 'Cluttered UI',
      labelB: 'Clean UI',
      valueA: results.cluttered,
      valueB: results.clean,
      unitLabel: 'ms',
      title: 'Time to Locate the Right Button'
    });
    trial.save(results);
    Trial.renderResultCard(resultsEl, {
      yours: `${Math.max(0, results.cluttered - results.clean)}ms slower with more visual noise`,
      benchmark: 'Reducing on-screen clutter typically shortens the time to find and act on the right control',
      rule: 'The more mental effort an interface demands, the slower and more error-prone interaction becomes.'
    });
  }

  return () => trial.cleanup();
}
