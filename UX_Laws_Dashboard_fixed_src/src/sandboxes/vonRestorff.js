import { Trial } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('von-restorff-effect');
  let picksWithHighlight = { Basic: 0, Pro: 0, Enterprise: 0, Ultra: 0 };
  let picksWithoutHighlight = { Basic: 0, Pro: 0, Enterprise: 0, Ultra: 0 };
  let roundsDone = 0;
  const TOTAL_ROUNDS = 4;
  let isHighlightActive = true;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="award"></i> Von Restorff Effect (Isolation Effect)</h3>
    <p class="sandbox-desc">When multiple similar items are present, the one that differs from the rest is remembered and selected most frequently. Test plan selection under a 3-second decision timer.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="von-stage" style="width:100%;">
        <div style="display:flex; justify-content:space-between; font-size:13px; color:#aaa; margin-bottom:12px;">
          <span>Round <strong id="von-round-num" style="color:#ffaa00">1</strong> of ${TOTAL_ROUNDS}</span>
          <span id="von-timer" style="color:#e50914; font-weight:bold;">Timer: 3.0s</span>
        </div>

        <div id="von-pricing-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:10px; width:100%; margin-bottom:16px;"></div>

        <button id="von-start-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Round 1 (Highlight Active)</button>
      </div>

      <div id="von-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#von-stage');
  const roundNumEl = container.querySelector('#von-round-num');
  const timerEl = container.querySelector('#von-timer');
  const grid = container.querySelector('#von-pricing-grid');
  const startBtn = container.querySelector('#von-start-btn');
  const results = container.querySelector('#von-results');

  const plans = [
    { name: 'Basic', price: '$9/mo', desc: '1 User' },
    { name: 'Pro', price: '$29/mo', desc: '5 Users' },
    { name: 'Enterprise', price: '$99/mo', desc: 'Unlimited' },
    { name: 'Ultra', price: '$199/mo', desc: 'Custom' }
  ];

  function runRound() {
    grid.innerHTML = '';
    isHighlightActive = roundsDone % 2 === 0;

    // Shuffle plan positions
    const shuffled = [...plans].sort(() => Math.random() - 0.5);

    shuffled.forEach(p => {
      const card = document.createElement('div');
      const isProHighlighted = isHighlightActive && p.name === 'Pro';

      card.style.cssText = `
        background: ${isProHighlighted ? 'linear-gradient(135deg, #e50914 0%, #b20710 100%)' : '#222'};
        border: ${isProHighlighted ? '2px solid #fff' : '1px solid #444'};
        transform: ${isProHighlighted ? 'scale(1.05)' : 'scale(1)'};
        padding: 12px 8px; border-radius:8px; text-align:center; cursor:pointer;
        box-shadow: ${isProHighlighted ? '0 0 15px rgba(229,9,20,0.6)' : 'none'};
        transition: all 0.2s; position:relative;
      `;

      if (isProHighlighted) {
        card.innerHTML += `<div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#ffaa00; color:#000; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:10px;">MOST POPULAR</div>`;
      }

      card.innerHTML += `
        <div style="font-size:13px; font-weight:bold; color:#fff;">${p.name}</div>
        <div style="font-size:15px; font-weight:800; color:${isProHighlighted ? '#fff' : '#46d369'}; margin:4px 0;">${p.price}</div>
        <div style="font-size:10px; color:${isProHighlighted ? '#eee' : '#aaa'};">${p.desc}</div>
      `;

      card.onclick = () => {
        if (isHighlightActive) {
          picksWithHighlight[p.name]++;
        } else {
          picksWithoutHighlight[p.name]++;
        }

        roundsDone++;
        if (roundsDone < TOTAL_ROUNDS) {
          roundNumEl.textContent = roundsDone + 1;
          startBtn.style.display = 'inline-block';
          startBtn.textContent = `Start Round ${roundsDone + 1} (${roundsDone % 2 === 0 ? 'Highlight On' : 'Highlight Off'})`;
          grid.innerHTML = '';
        } else {
          finishExperiment();
        }
      };

      grid.appendChild(card);
    });

    startBtn.style.display = 'none';

    let timeLeft = 3.0;
    const interval = trial.setInterval(() => {
      timeLeft -= 0.1;
      timerEl.textContent = `Timer: ${Math.max(0, timeLeft).toFixed(1)}s`;
      if (timeLeft <= 0) {
        clearInterval(interval);
        // Auto pick basic
        picksWithHighlight['Basic']++;
        roundsDone++;
        if (roundsDone < TOTAL_ROUNDS) {
          runRound();
        } else {
          finishExperiment();
        }
      }
    }, 100);
  }

  startBtn.onclick = () => {
    runRound();
  };

  function finishExperiment() {
    stage.style.display = 'none';

    renderBarChart(results, {
      labels: ['Basic', 'Pro (Isolated)', 'Enterprise', 'Ultra'],
      values: [picksWithHighlight.Basic, picksWithHighlight.Pro, picksWithHighlight.Enterprise, picksWithHighlight.Ultra],
      colors: ['#444', '#e50914', '#444', '#444'],
      title: 'Selection Count (When Pro Was Visually Isolated)'
    });

    trial.save({ picksWithHighlight, picksWithoutHighlight });

    Trial.renderResultCard(results, {
      yours: `Pro Plan (Visually Isolated) was chosen ${picksWithHighlight.Pro} times despite position shuffling`,
      benchmark: `Visually isolated targets receive up to 3.2× more click conversions`,
      rule: `When multiple similar objects are present, the one that differs from the rest is remembered best.`
    });
  }

  return () => trial.cleanup();
}
