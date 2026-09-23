import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('paradox-of-the-active-user');

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="fast-forward"></i> The Paradox of the Active User</h3>
    <p class="sandbox-desc">Real users almost never read instructions first — they jump in and learn by trial and error, even when a manual would save time.</p>
    <div class="sandbox-demo-box" id="pau-box" style="min-height:220px;"></div>
  `;

  const box = container.querySelector('#pau-box');

  box.innerHTML = `
    <p style="color:#fff; margin-bottom:16px;">You need to configure a new device. What do you do first?</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="pill-btn" id="pau-manual" style="flex:1; min-width:160px;">📖 Read the manual first</button>
      <button class="pill-btn" id="pau-jump" style="flex:1; min-width:160px; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff;">⚡ Just start pressing buttons</button>
    </div>
  `;

  const manualBtn = box.querySelector('#pau-manual');
  const jumpBtn = box.querySelector('#pau-jump');

  trial.addListener(manualBtn, 'click', () => runPath('manual'));
  trial.addListener(jumpBtn, 'click', () => runPath('jump'));

  function runPath(choice) {
    trial.start();
    if (choice === 'manual') {
      box.innerHTML = `<p style="color:#aaa;">Reading manual... (this always takes a fixed 4s, whether you needed all of it or not)</p>`;
      trial.setTimeout(() => showTask(choice, 4000), 800);
    } else {
      showTask(choice, 0);
    }
  }

  function showTask(choice, setupCost) {
    const target = [2, 1, 3];
    const instructions = choice === 'manual'
      ? `Now configure it: click the buttons in this order — <strong style="color:#ffaa00;">2 → 1 → 3</strong> (you already know this, you read the manual).`
      : `Now configure it: click the 3 buttons in the <strong style="color:#ffaa00;">correct order</strong> to finish. (No manual — you'll have to figure it out.)`;

    box.innerHTML = `
      <p style="color:#fff; margin-bottom:12px;">${instructions}</p>
      <div style="display:flex; gap:10px;">
        <button class="pill-btn task-btn" data-n="1">1</button>
        <button class="pill-btn task-btn" data-n="2">2</button>
        <button class="pill-btn task-btn" data-n="3">3</button>
      </div>
      <p id="pau-msg" style="color:#ff6b6b; margin-top:10px; min-height:16px;"></p>
    `;
    let clicked = [];
    let mistakes = 0;
    const msg = box.querySelector('#pau-msg');

    box.querySelectorAll('.task-btn').forEach(btn => {
      trial.addListener(btn, 'click', () => {
        const n = Number(btn.dataset.n);
        const expectedIndex = clicked.length;
        if (n !== target[expectedIndex]) {
          mistakes++;
          msg.textContent = choice === 'jump'
            ? `Oops — wrong order (trial and error). Try again. (${mistakes} mistake${mistakes === 1 ? '' : 's'} so far)`
            : `That wasn't the order from the manual — try again.`;
          clicked = [];
          return;
        }
        clicked.push(n);
        if (clicked.length === target.length) {
          const elapsedMs = Math.round(trial.elapsed() + setupCost);
          finish(choice, elapsedMs, mistakes);
        }
      });
    });
  }

  function finish(choice, totalMs, mistakes) {
    box.innerHTML = `<h4 style="color:#46d369;">Task complete via "${choice === 'manual' ? 'read manual first' : 'jump right in'}"</h4>`;
    trial.save({ choice, totalMs, mistakes });
    Trial.renderResultCard(box, {
      yours: `${totalMs}ms total, ${mistakes} mistake${mistakes === 1 ? '' : 's'} (including any setup/reading time)`,
      benchmark: 'Most real users pick "just start pressing buttons," even in studies where reading first is objectively faster',
      rule: 'People prefer to learn software through action and exploration rather than by reading documentation, even at a real cost in efficiency.'
    });
  }

  return () => trial.cleanup();
}
