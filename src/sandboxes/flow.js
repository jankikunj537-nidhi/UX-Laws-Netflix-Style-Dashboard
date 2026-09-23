import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('flow');
  let skill = 50;
  let challenge = 50;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="zap"></i> Flow: The Challenge/Skill Channel</h3>
    <p class="sandbox-desc">Flow happens when challenge and skill are both high and closely matched. Drag the sliders and watch the zone change.</p>
    <div class="sandbox-demo-box" id="flow-box" style="min-height:280px;">
      <div style="display:flex; gap:16px; margin-bottom:16px; flex-wrap:wrap;">
        <label style="flex:1; min-width:160px; color:#aaa; font-size:12px;">
          Your Skill Level: <strong id="flow-skill-val" style="color:#fff;">50</strong>
          <input id="flow-skill" type="range" min="0" max="100" value="50" style="width:100%;">
        </label>
        <label style="flex:1; min-width:160px; color:#aaa; font-size:12px;">
          Task Challenge: <strong id="flow-challenge-val" style="color:#fff;">50</strong>
          <input id="flow-challenge" type="range" min="0" max="100" value="50" style="width:100%;">
        </label>
      </div>
      <div style="position:relative; width:100%; max-width:340px; aspect-ratio:1; margin:0 auto; background:linear-gradient(135deg, #1a3a1a 0%, #111 45%, #3a1a1a 100%); border-radius:8px; border:1px solid rgba(255,255,255,0.15);">
        <div id="flow-dot" style="position:absolute; width:16px; height:16px; border-radius:50%; background:var(--netflix-red); box-shadow:0 0 12px rgba(229,9,20,0.8); transform:translate(-50%,-50%); transition:left 0.15s, top 0.15s;"></div>
        <span style="position:absolute; top:6px; right:8px; font-size:10px; color:#46d369;">FLOW ZONE</span>
        <span style="position:absolute; bottom:6px; left:8px; font-size:10px; color:#888;">BOREDOM</span>
        <span style="position:absolute; top:6px; left:8px; font-size:10px; color:#ff6b6b;">ANXIETY</span>
      </div>
      <p id="flow-status" style="text-align:center; margin-top:14px; font-weight:700; font-size:14px;"></p>
    </div>
  `;

  const box = container.querySelector('#flow-box');
  const skillInput = box.querySelector('#flow-skill');
  const challengeInput = box.querySelector('#flow-challenge');
  const dot = box.querySelector('#flow-dot');
  const status = box.querySelector('#flow-status');

  function update() {
    box.querySelector('#flow-skill-val').textContent = skill;
    box.querySelector('#flow-challenge-val').textContent = challenge;

    // x = skill (0-100 left-right), y = challenge (100-0 top-bottom, inverted so high challenge is up)
    dot.style.left = `${skill}%`;
    dot.style.top = `${100 - challenge}%`;

    const diff = challenge - skill;
    let label, color;
    if (skill > 60 && challenge > 60 && Math.abs(diff) < 25) {
      label = '🌊 FLOW — challenge and skill are matched and both high';
      color = '#46d369';
    } else if (challenge - skill > 25) {
      label = '😰 ANXIETY — the task is harder than your skill supports';
      color = '#ff6b6b';
    } else if (skill - challenge > 25) {
      label = '😴 BOREDOM — the task is too easy for your skill level';
      color = '#aaa';
    } else {
      label = '😐 APATHY / NEUTRAL — low engagement on both axes';
      color = '#888';
    }
    status.textContent = label;
    status.style.color = color;
  }

  trial.addListener(skillInput, 'input', (e) => { skill = Number(e.target.value); update(); });
  trial.addListener(challengeInput, 'input', (e) => { challenge = Number(e.target.value); update(); });
  update();

  trial.save({ note: 'interactive diagram explored' });

  return () => trial.cleanup();
}
