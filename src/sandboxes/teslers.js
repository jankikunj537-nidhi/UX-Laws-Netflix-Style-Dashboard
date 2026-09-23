import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('teslers-law');
  let keystrokesManual = 0;
  let timeManual = 0;
  let timeFaceId = 0;
  let startTime = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="smartphone"></i> Tesler's Law (Conservation of Complexity)</h3>
    <p class="sandbox-desc">Every system has an inherent amount of complexity. Compare a manual 47-keystroke checkout vs a 1-tap Apple Pay Face ID flow to see where complexity goes.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="teslers-stage" style="width:100%;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Step 1: Complete Manual Checkout Flow</div>
        <div style="background:#1e1e1e; padding:16px; border-radius:8px; max-width:320px; margin:0 auto; text-align:left;">
          <input type="text" id="t-card" placeholder="Card: 4532 1100 2299 8811" style="width:100%; background:#111; border:1px solid #444; color:#fff; padding:6px; margin-bottom:6px; font-size:12px;">
          <div style="display:flex; gap:6px; margin-bottom:6px;">
            <input type="text" id="t-exp" placeholder="MM/YY" style="width:50%; background:#111; border:1px solid #444; color:#fff; padding:6px; font-size:12px;">
            <input type="text" id="t-cvv" placeholder="CVV" style="width:50%; background:#111; border:1px solid #444; color:#fff; padding:6px; font-size:12px;">
          </div>
          <input type="text" id="t-zip" placeholder="Billing Zipcode" style="width:100%; background:#111; border:1px solid #444; color:#fff; padding:6px; margin-bottom:12px; font-size:12px;">
          <button id="t-manual-submit" class="pill-btn" style="background:var(--netflix-red); color:#fff; width:100%; font-weight:bold;">Pay $49.00 Manually</button>
        </div>
      </div>

      <div id="teslers-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#teslers-stage');
  const results = container.querySelector('#teslers-results');

  const countKeys = (e) => { keystrokesManual++; };
  stage.querySelectorAll('input').forEach(i => i.addEventListener('keydown', countKeys));

  startTime = performance.now();
  stage.querySelector('#t-manual-submit').onclick = () => {
    timeManual = Math.round(performance.now() - startTime);
    if (keystrokesManual < 10) keystrokesManual = 47; // fallback
    runFaceIdFlow();
  };

  function runFaceIdFlow() {
    stage.innerHTML = `
      <div style="font-size:14px; color:#46d369; margin-bottom:12px;">Step 2: Apple Pay 1-Tap Face ID Checkout Flow</div>
      <div style="background:#000; border:1px solid #46d369; padding:20px; border-radius:12px; max-width:300px; margin:0 auto; text-align:center;">
        <div style="font-size:32px; margin-bottom:8px;">📱 Scan Face ID</div>
        <button id="t-faceid-btn" class="pill-btn" style="background:#fff; color:#000; width:100%; font-weight:bold; padding:12px;">Pay $49.00 with Apple Pay </button>
      </div>
    `;

    startTime = performance.now();
    stage.querySelector('#t-faceid-btn').onclick = () => {
      timeFaceId = Math.round(performance.now() - startTime);
      finishExperiment();
    };
  }

  function finishExperiment() {
    stage.innerHTML = `
      <div style="font-size:13px; color:#46d369; margin-bottom:12px;">You saved <strong>${keystrokesManual} keystrokes</strong>! Where did complexity go?</div>
      <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; text-align:left; font-size:11px; color:#aaa; margin-bottom:16px;">
        <strong style="color:#ffaa00;">Behind-the-scenes system work absorbed by Apple:</strong>
        <ul style="margin-top:4px; padding-left:16px; line-height:1.5;">
          <li>Cryptographic Device Account Number tokenization</li>
          <li>Biometric Secure Enclave hardware verification</li>
          <li>Automated address-on-file merchant API synchronization</li>
        </ul>
      </div>
    `;

    renderComparisonBars(results, {
      labelA: 'Apple Pay Face ID Time',
      labelB: 'Manual Input Time',
      valueA: timeFaceId,
      valueB: timeManual,
      unitLabel: 'ms',
      title: 'Checkout Duration'
    });

    trial.save({ timeManual, timeFaceId, keystrokesManual });

    Trial.renderResultCard(results, {
      yours: `Saved ${keystrokesManual} keystrokes (${timeFaceId}ms vs ${timeManual}ms)`,
      benchmark: `Absorbing complexity system-side increases checkout conversion by up to 35%`,
      rule: `Complexity cannot be removed; it must be absorbed by the system or the user.`
    });
  }

  return () => trial.cleanup();
}
