import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('choice-overload');
  const results = {};

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="grid"></i> Choice Overload: Jam Aisle Experiment</h3>
    <p class="sandbox-desc">Round 1: pick a jam from 3 options. Round 2: pick a jam from 24 options. We'll time each decision.</p>
    <div class="sandbox-demo-box" id="co-box" style="min-height:220px;">
      <div id="co-round"></div>
    </div>
  `;

  const roundEl = container.querySelector('#co-round');
  const flavors = ['Strawberry','Raspberry','Blueberry','Apricot','Fig','Cherry','Peach','Plum','Mango','Kiwi',
    'Blackberry','Grape','Orange','Lemon','Lime','Pear','Pineapple','Guava','Papaya','Quince',
    'Cranberry','Elderberry','Gooseberry','Nectarine'];

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

  function runRound(n, key, onDone) {
    const options = shuffle(flavors).slice(0, n);
    roundEl.innerHTML = `
      <p style="color:#ffaa00; font-size:13px; margin-bottom:10px;">Pick a jam (${n} options):</p>
      <div id="co-options" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
    `;
    const optsEl = roundEl.querySelector('#co-options');
    options.forEach(flavor => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.textContent = flavor;
      trial.addListener(btn, 'click', () => {
        const ms = trial.elapsed();
        results[key] = ms;
        onDone();
      });
      optsEl.appendChild(btn);
    });
    trial.start();
  }

  runRound(3, 'small', () => {
    runRound(24, 'large', finish);
  });

  function finish() {
    roundEl.innerHTML = `<h4 style="color:#46d369;">Done! Here's how option count affected your decision time:</h4>
      <div id="co-results"></div>`;
    const resultsEl = roundEl.querySelector('#co-results');
    renderComparisonBars(resultsEl, {
      labelA: '3 options',
      labelB: '24 options',
      valueA: results.small,
      valueB: results.large,
      unitLabel: 'ms',
      title: 'Time to Decide'
    });
    trial.save(results);
    Trial.renderResultCard(resultsEl, {
      yours: `${results.large - results.small > 0 ? '+' : ''}${results.large - results.small}ms slower with more options`,
      benchmark: 'Studies show more options can increase decision time and lower satisfaction/confidence',
      rule: 'More choices increase the time and mental effort needed to make a decision.'
    });
  }

  return () => trial.cleanup();
}
