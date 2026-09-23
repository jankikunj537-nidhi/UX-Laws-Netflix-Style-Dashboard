import { Trial } from './trial.js';
import { renderScatterPlot, renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('fitts-law');
  let targetsHit = [];
  const TOTAL_TARGETS = 10;
  let targetStartTime = 0;
  let currentTargetData = null;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="target"></i> Fitts's Law Target Acquisition Experiment</h3>
    <p class="sandbox-desc">Click 10 targets of varying sizes and distances. Target acquisition time (MT) is a function of distance (D) and size (W): <code>MT = a + b log₂(2D/W)</code>.</p>

    <div class="sandbox-demo-box" id="fitts-box" style="min-height:300px; position:relative; overflow:hidden;">
      <div id="fitts-progress" style="width:100%; font-size:13px; color:#aaa; display:flex; justify-content:space-between; align-items:center;">
        <span>Progress: <strong id="fitts-count" style="color:#ffaa00">0</strong> / 10 targets</span>
        <span id="fitts-status" style="color:#46d369;">Click 'Start Experiment' to begin</span>
      </div>

      <div id="fitts-arena" style="width:100%; height:180px; background:#111; border-radius:8px; position:relative; overflow:hidden; margin:12px 0; border:1px solid rgba(255,255,255,0.1); touch-action:none;">
        <button id="fitts-start-btn" class="pill-btn" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:12px 24px;">Start Experiment</button>
      </div>

      <div id="fitts-results-area" style="width:100%;"></div>
    </div>
  `;

  const startBtn = container.querySelector('#fitts-start-btn');
  const arena = container.querySelector('#fitts-arena');
  const countEl = container.querySelector('#fitts-count');
  const statusEl = container.querySelector('#fitts-status');
  const resultsArea = container.querySelector('#fitts-results-area');

  function spawnTarget() {
    arena.innerHTML = '';
    if (targetsHit.length >= TOTAL_TARGETS) {
      finishExperiment();
      return;
    }

    const sizes = [24, 32, 48, 64, 90, 120];
    const W = sizes[Math.floor(Math.random() * sizes.length)];
    const arenaWidth = arena.clientWidth || 300;
    const arenaHeight = arena.clientHeight || 180;

    const maxLeft = arenaWidth - W - 10;
    const maxTop = arenaHeight - W - 10;
    const left = Math.max(10, Math.floor(Math.random() * maxLeft));
    const top = Math.max(10, Math.floor(Math.random() * maxTop));

    // Previous position or center
    const prevX = currentTargetData ? currentTargetData.x : arenaWidth / 2;
    const prevY = currentTargetData ? currentTargetData.y : arenaHeight / 2;
    const D = Math.round(Math.hypot(left + W / 2 - prevX, top + W / 2 - prevY));

    currentTargetData = { x: left + W / 2, y: top + W / 2, W, D };

    const target = document.createElement('button');
    target.className = 'fitts-target-btn';
    target.style.cssText = `
      position:absolute; left:${left}px; top:${top}px; width:${W}px; height:${W}px;
      background:var(--netflix-red); border:2px solid #fff; border-radius:50%;
      cursor:pointer; box-shadow:0 0 15px rgba(229,9,20,0.6); transition:transform 0.1s;
      touch-action:none; display:flex; align-items:center; justify-content:center;
      color:#fff; font-weight:bold; font-size:${Math.max(10, Math.floor(W/3))}px;
    `;
    target.textContent = `${targetsHit.length + 1}`;

    const handleHit = (e) => {
      e.preventDefault();
      const elapsed = Math.round(performance.now() - targetStartTime);
      const index = Math.log2((2 * D) / W + 1);
      targetsHit.push({ D, W, MT: elapsed, ID: index });

      countEl.textContent = targetsHit.length;
      statusEl.textContent = `Target ${targetsHit.length}: ${elapsed}ms (D:${D}px, W:${W}px)`;
      spawnTarget();
    };

    target.addEventListener('pointerdown', handleHit);
    arena.appendChild(target);
    targetStartTime = performance.now();
  }

  startBtn.onclick = () => {
    targetsHit = [];
    trial.start();
    spawnTarget();
  };

  function finishExperiment() {
    arena.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#46d369; font-weight:bold; font-size:16px;">Target Acquisition Complete!</div>`;
    
    // Calculate average MT
    const avgMT = Math.round(targetsHit.reduce((acc, t) => acc + t.MT, 0) / targetsHit.length);
    
    // Plot scatter points
    const points = targetsHit.map(t => ({ x: parseFloat(t.ID.toFixed(2)), y: t.MT }));
    
    resultsArea.innerHTML = `<h4 style="color:#fff; margin:16px 0 8px; font-size:14px;">Index of Difficulty (ID) vs Movement Time (MT)</h4>`;
    
    renderScatterPlot(resultsArea, {
      points,
      xLabel: 'Index of Difficulty (bits)',
      yLabel: 'Movement Time (ms)',
      title: 'Your Performance Plot'
    });

    // Final Comparison challenge
    const bonusBox = document.createElement('div');
    bonusBox.style.cssText = 'margin-top:16px; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;';
    bonusBox.innerHTML = `
      <h4 style="color:#ffaa00; font-size:13px; margin-bottom:8px;">Live Challenge: Amazon Buy Button vs 1999 Tiny Button</h4>
      <div id="fitts-comparison-area"></div>
    `;
    resultsArea.appendChild(bonusBox);

    renderComparisonBars(bonusBox.querySelector('#fitts-comparison-area'), {
      labelA: 'Amazon Large CTA (140px, Corner)',
      labelB: '1999 Micro Button (12px, Center)',
      valueA: Math.round(avgMT * 0.55),
      valueB: Math.round(avgMT * 1.85),
      unitLabel: 'ms'
    });

    trial.save({ avgMT, targetsHit });
    Trial.renderResultCard(resultsArea, {
      yours: `${avgMT}ms avg hit time`,
      benchmark: `~350ms - 550ms`,
      rule: `Target acquisition time decreases as size (W) increases & distance (D) decreases.`
    });
  }

  return () => trial.cleanup();
}
