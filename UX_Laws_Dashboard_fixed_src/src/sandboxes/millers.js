import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('millers-law');
  let step = 1; // 1 = raw memorize, 2 = raw input, 3 = chunked memorize, 4 = chunked input, 5 = results
  const rawDigits = '4839261057';
  const chunkedDigits = '4839 2610 57';
  let scoreRaw = 0;
  let scoreChunked = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="cpu"></i> Miller's Law Working Memory Experiment</h3>
    <p class="sandbox-desc">Test your working memory retention for 10 unchunked digits vs 10 chunked digits (7 ± 2 capacity rule).</p>

    <div class="sandbox-demo-box" style="min-height:280px; text-align:center;">
      <div id="millers-stage-area" style="width:100%;">
        <p style="color:#aaa; font-size:14px; margin-bottom:12px;">Round 1: You will be shown a 10-digit raw string for 5 seconds.</p>
        <button id="millers-start-btn" class="pill-btn" style="background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700;">Start Memory Test</button>
      </div>

      <div id="millers-results-area" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stageArea = container.querySelector('#millers-stage-area');
  const startBtn = container.querySelector('#millers-start-btn');
  const resultsArea = container.querySelector('#millers-results-area');

  startBtn.onclick = () => {
    runRound1();
  };

  function runRound1() {
    stageArea.innerHTML = `
      <div style="font-size:13px; color:#ffaa00; margin-bottom:8px;">Memorize these digits (5 seconds remaining):</div>
      <div id="millers-countdown" style="font-size:32px; font-weight:800; font-family:monospace; color:#e50914; letter-spacing:4px; margin:16px 0;">${rawDigits}</div>
    `;

    let sec = 5;
    const interval = trial.setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(interval);
        promptInput1();
      } else {
        const timerEl = stageArea.querySelector('#millers-countdown');
        if (timerEl) timerEl.textContent = rawDigits;
      }
    }, 1000);
  }

  function promptInput1() {
    stageArea.innerHTML = `
      <div style="font-size:14px; color:#fff; margin-bottom:12px;">Type back the 10 unchunked digits:</div>
      <input type="text" id="millers-input-1" placeholder="Enter 10 digits..." maxlength="10" style="background:#111; border:1px solid #444; color:#fff; font-family:monospace; font-size:20px; padding:8px; text-align:center; border-radius:6px; width:220px; margin-bottom:12px;">
      <br>
      <button id="millers-submit-1" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:700;">Submit Round 1</button>
    `;

    stageArea.querySelector('#millers-submit-1').onclick = () => {
      const val = stageArea.querySelector('#millers-input-1').value.trim();
      scoreRaw = countMatchingDigits(val, rawDigits);
      runRound2();
    };
  }

  function runRound2() {
    stageArea.innerHTML = `
      <p style="color:#aaa; font-size:14px; margin-bottom:12px;">Round 2: Now memorize the same number chunked into 3 groups: <strong>${chunkedDigits}</strong> for 5 seconds.</p>
      <button id="millers-start-2" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:700;">Start Round 2</button>
    `;

    stageArea.querySelector('#millers-start-2').onclick = () => {
      stageArea.innerHTML = `
        <div style="font-size:13px; color:#46d369; margin-bottom:8px;">Memorize the chunked digits:</div>
        <div id="millers-countdown-2" style="font-size:32px; font-weight:800; font-family:monospace; color:#46d369; letter-spacing:4px; margin:16px 0;">${chunkedDigits}</div>
      `;

      let sec = 5;
      const interval = trial.setInterval(() => {
        sec--;
        if (sec <= 0) {
          clearInterval(interval);
          promptInput2();
        }
      }, 1000);
    };
  }

  function promptInput2() {
    stageArea.innerHTML = `
      <div style="font-size:14px; color:#fff; margin-bottom:12px;">Type back the chunked digits:</div>
      <input type="text" id="millers-input-2" placeholder="Enter digits..." maxlength="12" style="background:#111; border:1px solid #46d369; color:#fff; font-family:monospace; font-size:20px; padding:8px; text-align:center; border-radius:6px; width:220px; margin-bottom:12px;">
      <br>
      <button id="millers-submit-2" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:700;">Submit Round 2</button>
    `;

    stageArea.querySelector('#millers-submit-2').onclick = () => {
      const val = stageArea.querySelector('#millers-input-2').value.replace(/\s+/g, '');
      scoreChunked = countMatchingDigits(val, rawDigits);
      finishExperiment();
    };
  }

  function countMatchingDigits(input, target) {
    let matches = 0;
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) matches++;
    }
    return matches;
  }

  function finishExperiment() {
    stageArea.innerHTML = `
      <div style="margin-bottom:16px;">
        <h4 style="color:#ffaa00; font-size:14px; margin-bottom:8px;">Live Stripe-Style Card Auto-Chunking Demo</h4>
        <input type="text" id="stripe-input" placeholder="Type card number: 4532112288990022" style="background:#000; border:1px solid #ffaa00; color:#fff; font-family:monospace; font-size:16px; padding:10px; width:80%; max-width:320px; border-radius:6px; text-align:center;">
        <div id="stripe-formatted" style="font-family:monospace; color:#46d369; font-size:18px; margin-top:8px;"></div>
      </div>
    `;

    const stripeInput = stageArea.querySelector('#stripe-input');
    const stripeFormatted = stageArea.querySelector('#stripe-formatted');
    stripeInput.oninput = (e) => {
      const digits = e.target.value.replace(/\D/g, '');
      const chunks = digits.match(/.{1,4}/g) || [];
      stripeFormatted.textContent = chunks.join(' - ');
    };

    renderComparisonBars(resultsArea, {
      labelA: 'Chunked Memory Recall',
      labelB: 'Unchunked Memory Recall',
      valueA: scoreChunked,
      valueB: scoreRaw,
      unitLabel: '/10 digits',
      title: 'Digits Correctly Recalled'
    });

    trial.save({ scoreRaw, scoreChunked });

    Trial.renderResultCard(resultsArea, {
      yours: `Chunked: ${scoreChunked}/10 correct vs Unchunked: ${scoreRaw}/10 correct`,
      benchmark: `Chunking improves recall accuracy by 30% - 70%`,
      rule: `Average working memory holds 7 ± 2 items. Chunking increases capacity.`
    });
  }

  return () => trial.cleanup();
}
