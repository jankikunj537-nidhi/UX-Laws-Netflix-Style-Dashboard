import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('jakobs-law');
  let startTime = 0;
  let timeStandard = 0;
  let timeScrambled = 0;
  let misclicks = 0;
  let misclickCoords = [];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="layout"></i> Jakob's Law Mental Model Experiment</h3>
    <p class="sandbox-desc">Find and click the <strong>Shopping Cart (🛒)</strong> on two mock store layouts: Standard (Conventional) vs Scrambled (Unconventional).</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="jakobs-stage-area" style="width:100%;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Step 1: Standard E-Commerce Layout (Cart top-right, Logo top-left)</div>
        <button id="jakobs-start-1" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:700;">Start Standard Layout Test</button>
      </div>

      <div id="jakobs-results-area" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stageArea = container.querySelector('#jakobs-stage-area');
  const resultsArea = container.querySelector('#jakobs-results-area');

  stageArea.querySelector('#jakobs-start-1').onclick = () => {
    runStandardStore();
  };

  function runStandardStore() {
    stageArea.innerHTML = `
      <div style="font-size:12px; color:#ffaa00; margin-bottom:8px;">Locate and click the Shopping Cart icon (🛒)!</div>
      <div id="store-standard" style="width:100%; height:160px; background:#181818; border:1px solid #444; border-radius:8px; position:relative; overflow:hidden; touch-action:none;">
        <div style="position:absolute; top:10px; left:12px; font-weight:bold; color:#fff; font-size:14px;">🛍️ NIKE STORE</div>
        <div style="position:absolute; top:10px; left:140px; font-size:11px; color:#aaa; display:flex; gap:12px;"><span>Men</span><span>Women</span><span>Kids</span></div>
        <button id="cart-standard" style="position:absolute; top:8px; right:12px; background:var(--netflix-red); color:#fff; border:none; border-radius:4px; padding:6px 12px; font-size:14px; cursor:pointer;">🛒 Cart (0)</button>
        <div style="position:absolute; bottom:20px; left:20px; color:#666; font-size:11px;">Product Catalog Banner Area</div>
      </div>
    `;

    startTime = performance.now();
    stageArea.querySelector('#cart-standard').onclick = () => {
      timeStandard = Math.round(performance.now() - startTime);
      runScrambledStore();
    };
  }

  function runScrambledStore() {
    stageArea.innerHTML = `
      <div style="font-size:12px; color:#e50914; margin-bottom:8px;">Step 2: Scrambled Layout! Find and click the Cart icon!</div>
      <div id="store-scrambled" style="width:100%; height:160px; background:#181818; border:1px solid #e50914; border-radius:8px; position:relative; overflow:hidden; touch-action:none;">
        <div style="position:absolute; top:10px; right:12px; font-weight:bold; color:#fff; font-size:14px;">🛍️ NIKE STORE</div>
        <div style="position:absolute; top:10px; left:12px; font-size:11px; color:#aaa;">🔍 Search</div>
        <!-- Scrambled Cart placed bottom-left -->
        <button id="cart-scrambled" style="position:absolute; bottom:12px; left:12px; background:#444; color:#fff; border:none; border-radius:4px; padding:6px 12px; font-size:13px; cursor:pointer;">🛒 Cart (0)</button>
        <div style="position:absolute; bottom:12px; right:12px; color:#666; font-size:11px;">Navigation Links</div>
      </div>
    `;

    const scrambledStore = stageArea.querySelector('#store-scrambled');
    startTime = performance.now();

    scrambledStore.onclick = (e) => {
      if (e.target.id === 'cart-scrambled') {
        timeScrambled = Math.round(performance.now() - startTime);
        finishExperiment();
      } else {
        misclicks++;
        const rect = scrambledStore.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        misclickCoords.push({ x, y });

        // Render misclick heat dot
        const dot = document.createElement('div');
        dot.style.cssText = `position:absolute; left:${x-6}px; top:${y-6}px; width:12px; height:12px; background:rgba(229,9,20,0.8); border-radius:50%; pointer-events:none; box-shadow:0 0 10px #e50914;`;
        scrambledStore.appendChild(dot);
      }
    };
  }

  function finishExperiment() {
    stageArea.innerHTML = `
      <div style="font-size:13px; color:#46d369; margin-bottom:12px;">Test Complete! Misclicks on Scrambled layout: <strong style="color:#e50914">${misclicks}</strong> (clustered where cart top-right should be).</div>
    `;

    renderComparisonBars(resultsArea, {
      labelA: 'Standard Layout Time',
      labelB: 'Scrambled Layout Time',
      valueA: timeStandard,
      valueB: timeScrambled,
      unitLabel: 'ms',
      title: 'Time to Locate Cart'
    });

    trial.save({ timeStandard, timeScrambled, misclicks });

    Trial.renderResultCard(resultsArea, {
      yours: `Standard: ${timeStandard}ms vs Scrambled: ${timeScrambled}ms (${misclicks} misclicks)`,
      benchmark: `Unconventional UI patterns cause 2.5× to 4× higher task completion latency`,
      rule: `Users spend most time on other sites; they expect your site to work the same way.`
    });
  }

  return () => trial.cleanup();
}
