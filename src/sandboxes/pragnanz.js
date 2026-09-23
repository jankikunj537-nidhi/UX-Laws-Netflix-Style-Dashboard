import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('law-of-pragnanz');
  let choice = '';

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="aperture"></i> Law of Prägnanz (Simplicity & Order)</h3>
    <p class="sandbox-desc">People interpret complex or ambiguous images as the simplest form possible. Flash test: a complex logo vs a minimalist geometric logo shown for 300ms.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="prag-stage" style="width:100%; text-align:center;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Flash both logos for 300ms each and pick which one you remember accurately.</div>
        <button id="prag-start-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start 300ms Flash Test</button>
      </div>

      <div id="prag-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#prag-stage');
  const startBtn = container.querySelector('#prag-start-btn');
  const results = container.querySelector('#prag-results');

  startBtn.onclick = () => {
    stage.innerHTML = `
      <div style="font-size:13px; color:#ffaa00; margin-bottom:12px;">Flashing (300ms)...</div>
      <div style="display:flex; gap:20px; justify-content:center; align-items:center; height:120px;">
        <div style="font-size:48px;">✔️</div>
        <div style="font-size:32px;">⚜️🛡️🐉⚔️</div>
      </div>
    `;

    trial.setTimeout(() => {
      promptChoice();
    }, 300);
  };

  function promptChoice() {
    stage.innerHTML = `
      <div style="font-size:14px; color:#fff; margin-bottom:12px;">Which shape can you accurately recall and redraw from memory?</div>
      <div style="display:flex; gap:16px; justify-content:center;">
        <button id="pick-simple" class="pill-btn" style="padding:16px 24px; font-size:18px;">Simple Swoosh (Nike ✔️)</button>
        <button id="pick-complex" class="pill-btn" style="padding:16px 24px; font-size:18px;">Detailed Crest (⚜️🛡️🐉)</button>
      </div>
    `;

    stage.querySelector('#pick-simple').onclick = () => finish('Simple Swoosh');
    stage.querySelector('#pick-complex').onclick = () => finish('Detailed Crest');
  }

  function finish(pick) {
    choice = pick;
    stage.innerHTML = `<div style="font-size:14px; color:#46d369;">You picked <strong>${pick}</strong>. Simple geometric shapes are processed and retained 10× faster by the brain.</div>`;

    trial.save({ choice });

    Trial.renderResultCard(results, {
      yours: `You selected the ${pick}. Simple shapes reduce cognitive interpretation effort to < 50ms.`,
      benchmark: `Minimalist iconic logos (Apple, Nike) enjoy 94% higher brand recall than complex crests`,
      rule: `People will perceive and interpret ambiguous or complex images as the simplest form possible.`
    });
  }

  return () => trial.cleanup();
}
