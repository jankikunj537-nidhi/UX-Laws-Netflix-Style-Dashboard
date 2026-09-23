import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('chunking');
  const results = {};

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="hash"></i> Chunking: Memorize the Number</h3>
    <p class="sandbox-desc">You'll briefly see a 9-digit number, once unchunked and once grouped into chunks. Try to recall each one.</p>
    <div class="sandbox-demo-box" id="chunk-box" style="min-height:200px;"></div>
  `;

  const box = container.querySelector('#chunk-box');

  function digits() {
    let s = '';
    for (let i = 0; i < 9; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function runRound(chunked, key, onDone) {
    const num = digits();
    const display = chunked ? `${num.slice(0,3)}-${num.slice(3,6)}-${num.slice(6,9)}` : num;

    box.innerHTML = `
      <p style="color:#ffaa00; font-size:13px; margin-bottom:16px;">${chunked ? 'Chunked' : 'Unchunked'} — memorize this:</p>
      <div style="font-size:36px; font-weight:800; letter-spacing:2px; color:#fff; text-align:center; margin:20px 0;">${display}</div>
    `;

    trial.setTimeout(() => {
      box.innerHTML = `
        <p style="color:#ffaa00; font-size:13px; margin-bottom:10px;">Now type it back (digits only):</p>
        <input id="chunk-input" type="text" inputmode="numeric" maxlength="9" style="width:100%; padding:12px; font-size:20px; letter-spacing:3px; text-align:center; background:#111; border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:#fff;" autofocus>
        <button class="pill-btn" id="chunk-submit" style="margin-top:12px; width:100%; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff;">Submit</button>
      `;
      const input = box.querySelector('#chunk-input');
      const submitBtn = box.querySelector('#chunk-submit');
      const submit = () => {
        const guess = input.value.replace(/\D/g, '');
        let correctDigits = 0;
        for (let i = 0; i < num.length; i++) if (guess[i] === num[i]) correctDigits++;
        results[key] = Math.round((correctDigits / num.length) * 100);
        onDone();
      };
      trial.addListener(submitBtn, 'click', submit);
      trial.addListener(input, 'keydown', (e) => { if (e.key === 'Enter') submit(); });
    }, 2500);
  }

  runRound(false, 'unchunked', () => runRound(true, 'chunked', finish));

  function finish() {
    box.innerHTML = `<h4 style="color:#46d369;">Recall accuracy comparison:</h4><div id="chunk-results"></div>`;
    const resultsEl = box.querySelector('#chunk-results');
    renderComparisonBars(resultsEl, {
      labelA: 'Unchunked',
      labelB: 'Chunked',
      valueA: results.unchunked,
      valueB: results.chunked,
      unitLabel: '%',
      title: 'Recall Accuracy'
    });
    trial.save(results);
    Trial.renderResultCard(resultsEl, {
      yours: `${results.chunked >= results.unchunked ? 'Chunked recall was higher or equal' : 'Unchunked recall was higher this time'}`,
      benchmark: 'Chunked formats (e.g. phone numbers, credit cards) are typically recalled more accurately',
      rule: 'Breaking information into small, meaningful groups makes it easier to hold in memory.'
    });
  }

  return () => trial.cleanup();
}
