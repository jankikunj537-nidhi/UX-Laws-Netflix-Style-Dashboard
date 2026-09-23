import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('doherty-threshold');
  let clickCount = 0;
  let abandonedUsers = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="zap"></i> Doherty Threshold (< 400ms Response Time)</h3>
    <p class="sandbox-desc">Drag the latency slider (0–2000ms) and click "Search" 6 times. Feel how system response latency directly affects flow state and user retention.</p>

    <div class="sandbox-demo-box" style="min-height:280px;">
      <div style="width:100%; max-width:400px; text-align:left; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label style="font-size:14px; font-weight:700; color:#fff;">System Latency Delay:</label>
          <span id="doherty-val" style="color:#ffaa00; font-weight:bold; font-size:16px;">100 ms</span>
        </div>
        <input type="range" id="doherty-slider" min="0" max="2000" step="50" value="100" style="width:100%; accent-color:var(--netflix-red); cursor:pointer;">
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-top:2px;">
          <span>0ms (Instant)</span>
          <span style="color:#46d369; font-weight:bold;">400ms Threshold</span>
          <span>2000ms (Sluggish)</span>
        </div>
      </div>

      <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:12px;">
        <button id="doherty-action-btn" class="pill-btn" style="background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:12px 32px; font-size:14px; touch-action:manipulation;">
          🔍 Perform Search Action (<span id="doherty-clicks-left">6</span> clicks remaining)
        </button>

        <div id="doherty-status-badge" class="sandbox-score-badge" style="width:100%; max-width:380px; text-align:center;">
          Status: Ready (Latency under 400ms threshold ⚡)
        </div>
      </div>

      <div style="width:100%; display:flex; justify-content:space-around; margin-top:20px; background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#aaa;">Flow State Indicator</div>
          <div id="doherty-flow-indicator" style="font-size:16px; font-weight:bold; color:#46d369;">🟢 ACTIVE FLOW</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#aaa;">Estimated Abandonment</div>
          <div id="doherty-abandon-count" style="font-size:16px; font-weight:bold; color:#888;">0 Users</div>
        </div>
      </div>

      <div id="doherty-results-area" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const slider = container.querySelector('#doherty-slider');
  const valText = container.querySelector('#doherty-val');
  const actionBtn = container.querySelector('#doherty-action-btn');
  const clicksLeftEl = container.querySelector('#doherty-clicks-left');
  const statusBadge = container.querySelector('#doherty-status-badge');
  const flowIndicator = container.querySelector('#doherty-flow-indicator');
  const abandonCountEl = container.querySelector('#doherty-abandon-count');
  const resultsArea = container.querySelector('#doherty-results-area');

  slider.oninput = (e) => {
    const ms = parseInt(e.target.value);
    valText.textContent = `${ms} ms`;
    updateIndicators(ms);
  };

  function updateIndicators(ms) {
    if (ms <= 400) {
      statusBadge.textContent = `Status: Flow state maintained (${ms}ms < 400ms threshold ⚡)`;
      statusBadge.style.color = '#46d369';
      statusBadge.style.borderColor = 'rgba(70,211,105,0.3)';
      flowIndicator.textContent = '🟢 ACTIVE FLOW';
      flowIndicator.style.color = '#46d369';
    } else {
      statusBadge.textContent = `Status: Friction detected (${ms}ms exceeds 400ms threshold 🐢)`;
      statusBadge.style.color = '#e50914';
      statusBadge.style.borderColor = 'rgba(229,9,20,0.3)';
      flowIndicator.textContent = '🔴 BROKEN FOCUS';
      flowIndicator.style.color = '#e50914';
    }
  }

  actionBtn.onclick = () => {
    const ms = parseInt(slider.value);
    clickCount++;
    const remaining = Math.max(0, 6 - clickCount);
    clicksLeftEl.textContent = remaining;

    actionBtn.disabled = true;
    actionBtn.textContent = `Processing (${ms}ms delay)...`;

    trial.setTimeout(() => {
      actionBtn.disabled = false;
      actionBtn.innerHTML = `🔍 Perform Search Action (<span id="doherty-clicks-left">${remaining}</span> clicks remaining)`;

      if (ms > 400) {
        abandonedUsers += Math.floor((ms - 400) / 100);
        abandonCountEl.textContent = `${abandonedUsers} Users`;
        abandonCountEl.style.color = '#e50914';
      }

      if (clickCount >= 6) {
        finishExperiment(ms);
      }
    }, ms);
  };

  function finishExperiment(lastMs) {
    trial.save({ clickCount, lastMs, abandonedUsers });

    Trial.renderResultCard(resultsArea, {
      yours: `Tested at ${lastMs}ms latency. Abandonment score: ${abandonedUsers} users.`,
      benchmark: `Response times < 400ms keep user attention locked in flow state.`,
      rule: `Productivity soars when computer and users interact at a pace (< 400ms) that ensures neither waits.`
    });
  }

  return () => trial.cleanup();
}
