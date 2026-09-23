import { Trial } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('cognitive-bias');
  const guesses = {};

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="anchor"></i> Cognitive Bias: The Anchoring Effect</h3>
    <p class="sandbox-desc">Two quick questions with a hidden twist — a random "anchor" number appears before each guess.</p>
    <div class="sandbox-demo-box" id="bias-box" style="min-height:220px;"></div>
  `;

  const box = container.querySelector('#bias-box');
  const items = [
    { label: 'the tallest redwood tree in the world (in feet)', anchorHigh: 1200, anchorLow: 55 },
    { label: 'the population of New Zealand (in millions)', anchorHigh: 900, anchorLow: 0.4 },
  ];

  function runItem(index, onDone) {
    const item = items[index];
    const useHigh = index === 0;
    const anchor = useHigh ? item.anchorHigh : item.anchorLow;

    box.innerHTML = `
      <p style="color:#aaa; font-size:13px;">Is the answer higher or lower than <strong style="color:#ffaa00;">${anchor}</strong>?</p>
      <p style="color:#fff; margin:10px 0;">Now, what's your best guess for ${item.label}?</p>
      <input id="bias-input" type="number" style="width:100%; padding:10px; font-size:16px; background:#111; border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:#fff;" placeholder="Your guess">
      <button class="pill-btn" id="bias-submit" style="margin-top:12px; width:100%; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff;">Submit Guess</button>
    `;
    const input = box.querySelector('#bias-input');
    const submitBtn = box.querySelector('#bias-submit');
    const submit = () => {
      const val = parseFloat(input.value);
      if (isNaN(val)) return;
      guesses[useHigh ? 'highAnchor' : 'lowAnchor'] = val;
      onDone();
    };
    trial.addListener(submitBtn, 'click', submit);
    trial.addListener(input, 'keydown', (e) => { if (e.key === 'Enter') submit(); });
  }

  runItem(0, () => runItem(1, finish));

  function finish() {
    box.innerHTML = `<h4 style="color:#46d369;">See the pull of the anchor:</h4><div id="bias-results"></div>`;
    const resultsEl = box.querySelector('#bias-results');
    renderBarChart(resultsEl, {
      labels: ['After High Anchor', 'After Low Anchor'],
      values: [guesses.highAnchor || 0, guesses.lowAnchor || 0],
      title: 'Your Two Guesses (different questions, but same bias effect)'
    });
    trial.save(guesses);
    Trial.renderResultCard(resultsEl, {
      yours: `Guess 1: ${guesses.highAnchor} · Guess 2: ${guesses.lowAnchor}`,
      benchmark: 'People consistently guess higher after seeing a high anchor number, and lower after a low one — even on unrelated questions',
      rule: 'An initial number, even an arbitrary one, biases subsequent numeric estimates toward it.'
    });
  }

  return () => trial.cleanup();
}
