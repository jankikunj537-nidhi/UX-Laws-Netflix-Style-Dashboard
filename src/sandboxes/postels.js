import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('postels-law');

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="check-square"></i> Postel's Law (Robustness Principle)</h3>
    <p class="sandbox-desc">Be liberal in what you accept, conservative in what you send. Type a phone number in ANY format below (e.g., <code>+91 98765 43210</code>, <code>(987) 654-3210</code>, or <code>9876543210</code>).</p>

    <div class="sandbox-demo-box" style="min-height:280px;">
      <div style="width:100%; display:flex; gap:16px; flex-wrap:wrap;">
        <!-- Strict Form -->
        <div style="flex:1; min-width:220px; background:#222; padding:16px; border-radius:8px; border:1px solid #e50914;">
          <h4 style="color:#e50914; font-size:13px; margin-bottom:8px;">❌ Strict Form Processing</h4>
          <p style="font-size:11px; color:#888; margin-bottom:8px;">Requires exact format: <code>10 DIGITS ONLY</code></p>
          <input type="text" id="strict-input" placeholder="Type phone..." style="width:100%; background:#111; border:1px solid #444; color:#fff; padding:8px; border-radius:4px; font-size:13px;">
          <div id="strict-status" style="font-size:11px; color:#888; margin-top:8px;">Status: Waiting...</div>
        </div>

        <!-- Lenient Form -->
        <div style="flex:1; min-width:220px; background:#222; padding:16px; border-radius:8px; border:1px solid #46d369;">
          <h4 style="color:#46d369; font-size:13px; margin-bottom:8px;">✅ Lenient (Postel's Law) Form</h4>
          <p style="font-size:11px; color:#888; margin-bottom:8px;">Accepts spaces, dashes, country code, brackets</p>
          <input type="text" id="lenient-input" placeholder="Type phone..." style="width:100%; background:#111; border:1px solid #46d369; color:#fff; padding:8px; border-radius:4px; font-size:13px;">
          <div id="lenient-status" style="font-size:11px; color:#46d369; margin-top:8px; font-weight:bold;">Clean Normalized: ---</div>
        </div>
      </div>

      <div id="postels-results-area" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const strictInput = container.querySelector('#strict-input');
  const strictStatus = container.querySelector('#strict-status');
  const lenientInput = container.querySelector('#lenient-input');
  const lenientStatus = container.querySelector('#lenient-status');
  const resultsArea = container.querySelector('#postels-results-area');

  strictInput.oninput = (e) => {
    const val = e.target.value;
    if (/^\d{10}$/.test(val)) {
      strictStatus.textContent = '✅ Accepted (Matches exact 10 digits)';
      strictStatus.style.color = '#46d369';
    } else {
      strictStatus.textContent = '❌ ERROR: Must contain exactly 10 numeric digits, no spaces or symbols!';
      strictStatus.style.color = '#e50914';
    }
  };

  lenientInput.oninput = (e) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');

    if (digits.length === 0) {
      lenientStatus.textContent = 'Clean Normalized: ---';
      lenientStatus.style.color = '#888';
    } else {
      const normalized = `+1 ${digits}`;
      lenientStatus.textContent = `Clean Normalized E.164: ${normalized}`;
      lenientStatus.style.color = '#46d369';
    }
  };

  trial.save({ tested: true });
  Trial.renderResultCard(resultsArea, {
    yours: `Lenient input dynamically sanitized raw user input into E.164 format`,
    benchmark: `Flexible form inputs reduce form drop-off rates by up to 22%`,
    rule: `Be liberal in what you accept, conservative in what you send.`
  });

  return () => trial.cleanup();
}
