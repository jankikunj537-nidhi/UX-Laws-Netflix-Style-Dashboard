import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('parkinsons-law');
  let timeUntimed = 0;
  let timeTimed = 0;
  let startTime = 0;

  const items = ['1. Red 🔴', '2. Orange 🟠', '3. Yellow 🟡', '4. Green 🟢', '5. Blue 🔵', '6. Purple 🟣'];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="clock"></i> Parkinson's Law (Task Time Inflation)</h3>
    <p class="sandbox-desc">Work expands to fill the time available for its completion. Perform the same sorting task twice: Round 1 untimed vs Round 2 with a visible 15-second countdown timer.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="park-stage" style="width:100%;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Round 1: Sort 6 items into correct color order (Untimed / Open-ended)</div>
        <button id="park-start-1" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Round 1 (Untimed)</button>
      </div>

      <div id="park-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#park-stage');
  const results = container.querySelector('#park-results');

  stage.querySelector('#park-start-1').onclick = () => {
    runRound1();
  };

  function runRound1() {
    stage.innerHTML = `
      <div style="font-size:12px; color:#ffaa00; margin-bottom:8px;">Click items in sequential order 1 through 6:</div>
      <div id="park-grid-1" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:12px;">
        ${[...items].sort(() => Math.random() - 0.5).map(item => `<button class="pill-btn p-item-1" style="padding:10px;">${item}</button>`).join('')}
      </div>
    `;

    let expected = 1;
    startTime = performance.now();
    stage.querySelectorAll('.p-item-1').forEach(btn => {
      btn.onclick = () => {
        const num = parseInt(btn.textContent);
        if (num === expected) {
          btn.style.background = '#46d369';
          btn.disabled = true;
          expected++;
          if (expected > 6) {
            timeUntimed = Math.round(performance.now() - startTime);
            promptRound2();
          }
        }
      };
    });
  }

  function promptRound2() {
    stage.innerHTML = `
      <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Round 2: Sort the same 6 items with a visible 15-Second Countdown Timer!</div>
      <button id="park-start-2" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Round 2 (15s Timer)</button>
    `;

    stage.querySelector('#park-start-2').onclick = () => {
      runRound2();
    };
  }

  function runRound2() {
    stage.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:13px; color:#e50914; font-weight:bold; margin-bottom:8px;">
        <span>Click 1 through 6:</span>
        <span id="park-countdown">Timer: 15.0s</span>
      </div>
      <div id="park-grid-2" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:12px;">
        ${[...items].sort(() => Math.random() - 0.5).map(item => `<button class="pill-btn p-item-2" style="padding:10px;">${item}</button>`).join('')}
      </div>
    `;

    const timerEl = stage.querySelector('#park-countdown');
    let timeLeft = 15.0;
    const interval = trial.setInterval(() => {
      timeLeft -= 0.1;
      if (timerEl) timerEl.textContent = `Timer: ${Math.max(0, timeLeft).toFixed(1)}s`;
    }, 100);

    let expected = 1;
    startTime = performance.now();
    stage.querySelectorAll('.p-item-2').forEach(btn => {
      btn.onclick = () => {
        const num = parseInt(btn.textContent);
        if (num === expected) {
          btn.style.background = '#46d369';
          btn.disabled = true;
          expected++;
          if (expected > 6) {
            clearInterval(interval);
            timeTimed = Math.round(performance.now() - startTime);
            finishExperiment();
          }
        }
      };
    });
  }

  function finishExperiment() {
    stage.innerHTML = `<div style="font-size:13px; color:#46d369;">Untimed: ${timeUntimed}ms vs Timed: ${timeTimed}ms! You completed the task faster when bounded by a timer.</div>`;

    renderComparisonBars(results, {
      labelA: 'Timed Round Duration',
      labelB: 'Untimed Round Duration',
      valueA: timeTimed,
      valueB: timeUntimed,
      unitLabel: 'ms',
      title: 'Task Completion Speed Comparison'
    });

    trial.save({ timeUntimed, timeTimed });

    Trial.renderResultCard(results, {
      yours: `Bounded timer reduced task execution duration from ${timeUntimed}ms to ${timeTimed}ms`,
      benchmark: `Clear deadline bounds (e.g. 10-min Ticketmaster cart hold) accelerate task completion momentum`,
      rule: `Any task will inflate in time and complexity to fill the time available for its completion.`
    });
  }

  return () => trial.cleanup();
}
