import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('law-of-uniform-connectedness');
  let lineConnected = true;
  let hasInteracted = false;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="share-2"></i> Law of Uniform Connectedness</h3>
    <p class="sandbox-desc">Elements connected by lines or frames are perceived as more related than elements with no connection. Connecting lines beat spatial proximity.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:13px; color:#aaa;">Stepper Line Connector:</span>
        <button id="conn-toggle" class="pill-btn active" style="background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:bold;">Toggle Line OFF</button>
      </div>

      <!-- Stepper Widget -->
      <div id="conn-stepper-container" style="width:100%; max-width:400px; position:relative; padding:20px 0;">
        <!-- Connecting Line -->
        <div id="conn-line" style="position:absolute; top:36px; left:12%; right:12%; height:4px; background:var(--netflix-red); z-index:1; transition:opacity 0.2s;"></div>

        <!-- Stepper Nodes -->
        <div style="display:flex; justify-content:space-between; position:relative; z-index:2;">
          <div style="text-align:center;">
            <div style="width:36px; height:36px; background:#46d369; color:#000; font-weight:bold; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 6px;">✓</div>
            <div style="font-size:11px; color:#fff;">Cart</div>
          </div>

          <div style="text-align:center;">
            <div style="width:36px; height:36px; background:var(--netflix-red); color:#fff; font-weight:bold; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 6px; box-shadow:0 0 10px #e50914;">2</div>
            <div style="font-size:11px; color:#ffaa00; font-weight:bold;">Address</div>
          </div>

          <div style="text-align:center;">
            <div style="width:36px; height:36px; background:#333; color:#aaa; font-weight:bold; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 6px;">3</div>
            <div style="font-size:11px; color:#888;">Payment</div>
          </div>

          <div style="text-align:center;">
            <div style="width:36px; height:36px; background:#333; color:#aaa; font-weight:bold; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 6px;">4</div>
            <div style="font-size:11px; color:#888;">Confirm</div>
          </div>
        </div>
      </div>

      <div id="conn-status" class="sandbox-score-badge" style="margin-top:16px; width:100%; text-align:center;">
        Line ON: Solid connecting line unifies 4 steps into a clear sequential workflow ✅
      </div>

      <div id="conn-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const toggleBtn = container.querySelector('#conn-toggle');
  const line = container.querySelector('#conn-line');
  const status = container.querySelector('#conn-status');
  const results = container.querySelector('#conn-results');

  toggleBtn.onclick = () => {
    lineConnected = !lineConnected;
    if (lineConnected) {
      toggleBtn.textContent = 'Toggle Line OFF';
      toggleBtn.classList.add('active');
      line.style.opacity = '1';
      status.textContent = 'Line ON: Solid connecting line unifies 4 steps into a clear sequential workflow ✅';
      status.style.color = '#46d369';
    } else {
      toggleBtn.textContent = 'Toggle Line ON';
      toggleBtn.classList.remove('active');
      line.style.opacity = '0';
      status.textContent = 'Line OFF: Without the connecting line, steps read as 4 isolated unrelated circles ❌';
      status.style.color = '#e50914';
    }

    if (!hasInteracted) {
      hasInteracted = true;
      trial.save({ tested: true });
      Trial.renderResultCard(results, {
        yours: `Visual connecting lines override distance and similarity to establish parent-child sequential relationships`,
        benchmark: `Connected steppers increase checkout flow comprehension accuracy by up to 58%`,
        rule: `Elements visually connected by lines or frames are perceived as more related.`
      });
    }
  };

  return () => trial.cleanup();
}
