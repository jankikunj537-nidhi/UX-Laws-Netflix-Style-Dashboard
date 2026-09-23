import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('law-of-proximity');

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="layers"></i> Law of Proximity (Spatial Grouping)</h3>
    <p class="sandbox-desc">Objects that are near each other are perceived as a group. Adjust inner label-to-box gap vs outer group gap to see how accuracy collapses when inner gap ≥ outer gap.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="width:100%; max-width:400px; text-align:left; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <label style="font-size:12px; color:#aaa;">Inner Gap (Label to Input): <strong id="inner-val" style="color:#ffaa00;">6px</strong></label>
        </div>
        <input type="range" id="inner-slider" min="0" max="60" value="6" style="width:100%; accent-color:var(--netflix-red);">

        <div style="display:flex; justify-content:space-between; margin-top:12px; margin-bottom:4px;">
          <label style="font-size:12px; color:#aaa;">Outer Group Gap (Field to Field): <strong id="outer-val" style="color:#ffaa00;">28px</strong></label>
        </div>
        <input type="range" id="outer-slider" min="0" max="60" value="28" style="width:100%; accent-color:var(--netflix-red);">
      </div>

      <!-- Demo Form Fields -->
      <div id="prox-form" style="display:flex; flex-direction:column; gap:28px; background:#111; padding:20px; border-radius:8px; border:1px solid #333; width:100%; max-width:320px;">
        <div class="field-group" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:12px; color:#fff; font-weight:bold;">First Name</label>
          <input type="text" placeholder="Enter first name..." style="background:#222; border:1px solid #444; color:#fff; padding:6px; border-radius:4px; font-size:12px;">
        </div>

        <div class="field-group" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:12px; color:#fff; font-weight:bold;">Last Name</label>
          <input type="text" placeholder="Enter last name..." style="background:#222; border:1px solid #444; color:#fff; padding:6px; border-radius:4px; font-size:12px;">
        </div>
      </div>

      <div id="prox-status" class="sandbox-score-badge" style="margin-top:16px; width:100%; text-align:center;">
        Grouping Rule: Clear visual association (Inner 6px < Outer 28px ✅)
      </div>

      <div id="prox-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const innerSlider = container.querySelector('#inner-slider');
  const outerSlider = container.querySelector('#outer-slider');
  const innerVal = container.querySelector('#inner-val');
  const outerVal = container.querySelector('#outer-val');
  const form = container.querySelector('#prox-form');
  const status = container.querySelector('#prox-status');
  const results = container.querySelector('#prox-results');

  function update() {
    const iG = parseInt(innerSlider.value);
    const oG = parseInt(outerSlider.value);

    innerVal.textContent = `${iG}px`;
    outerVal.textContent = `${oG}px`;

    form.style.gap = `${oG}px`;
    form.querySelectorAll('.field-group').forEach(fg => fg.style.gap = `${iG}px`);

    if (iG >= oG) {
      status.textContent = `❌ AMBIGUOUS GROUPING: Inner gap (${iG}px) ≥ Outer gap (${oG}px)! Labels appear to belong to adjacent inputs!`;
      status.style.color = '#e50914';
      status.style.borderColor = 'rgba(229,9,20,0.3)';
    } else {
      status.textContent = `✅ CLEAR GROUPING: Inner gap (${iG}px) < Outer gap (${oG}px). Visual hierarchy preserved!`;
      status.style.color = '#46d369';
      status.style.borderColor = 'rgba(70,211,105,0.3)';
    }
  }

  innerSlider.oninput = update;
  outerSlider.oninput = update;

  trial.save({ tested: true });
  Trial.renderResultCard(results, {
    yours: `Proximity grouping is relative, not absolute (Inner gap must be significantly smaller than outer gap)`,
    benchmark: `Correct spatial proximity reduces form field association errors by up to 88%`,
    rule: `Objects that are near, or proximate to one another, tend to be grouped together.`
  });

  return () => trial.cleanup();
}
