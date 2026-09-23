import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('working-memory');
  let span = 3;
  let sequence = [];
  let maxSuccess = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="cpu"></i> Working Memory: Digit Span Test</h3>
    <p class="sandbox-desc">Working memory holds a small amount of information for active use — typically around 4±1 items. We'll find your limit by increasing the sequence length each round.</p>
    <div class="sandbox-demo-box" id="wm-box" style="min-height:220px;">
      <button class="pill-btn" id="wm-start" style="width:100%; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:12px;">Start Test</button>
    </div>
  `;

  const box = container.querySelector('#wm-box');
  const startBtn = box.querySelector('#wm-start');

  trial.addListener(startBtn, 'click', playRound);

  function playRound() {
    sequence = Array.from({ length: span }, () => Math.floor(Math.random() * 9) + 1);
    let i = 0;
    box.innerHTML = `<div id="wm-display" style="font-size:44px; font-weight:800; text-align:center; color:#fff; min-height:60px;"></div>
      <p style="text-align:center; color:#aaa; font-size:12px;">Memorize the sequence of ${span} digits...</p>`;
    const display = box.querySelector('#wm-display');

    function showNext() {
      if (i >= sequence.length) {
        trial.setTimeout(showRecallPad, 500);
        return;
      }
      display.textContent = sequence[i];
      i++;
      trial.setTimeout(() => { display.textContent = ''; trial.setTimeout(showNext, 250); }, 650);
    }
    showNext();
  }

  function showRecallPad() {
    let entered = [];
    box.innerHTML = `
      <p style="color:#ffaa00; text-align:center; margin-bottom:10px;">Tap the digits in order:</p>
      <div id="wm-entered" style="min-height:30px; text-align:center; font-size:20px; letter-spacing:6px; color:#fff; margin-bottom:12px;"></div>
      <div id="wm-pad" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;"></div>
    `;
    const pad = box.querySelector('#wm-pad');
    const enteredEl = box.querySelector('#wm-entered');
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.textContent = n;
      trial.addListener(btn, 'click', () => {
        entered.push(n);
        enteredEl.textContent = entered.join(' ');
        if (entered.length === sequence.length) checkAnswer(entered);
      });
      pad.appendChild(btn);
    }
  }

  function checkAnswer(entered) {
    const correct = entered.every((n, idx) => n === sequence[idx]);
    if (correct) {
      maxSuccess = span;
      span++;
      box.innerHTML = `<p style="color:#46d369; text-align:center; margin-bottom:12px;">✓ Correct! Increasing to ${span} digits.</p>
        <button class="pill-btn" id="wm-next" style="width:100%;">Next Round</button>`;
      trial.addListener(box.querySelector('#wm-next'), 'click', playRound);
    } else {
      finish();
    }
  }

  function finish() {
    box.innerHTML = `<h4 style="color:#46d369;">Your working memory span: ${maxSuccess} digits</h4>`;
    trial.save({ maxSpan: maxSuccess });
    Trial.renderResultCard(box, {
      yours: `${maxSuccess} digit${maxSuccess === 1 ? '' : 's'} recalled correctly, in order`,
      benchmark: 'Most adults reliably hold around 4±1 chunks of information in working memory at once',
      rule: 'Working memory capacity is small and limited — interfaces that demand holding many items in mind at once will overload most users.'
    });
  }

  return () => trial.cleanup();
}
