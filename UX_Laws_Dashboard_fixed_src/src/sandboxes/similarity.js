import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('law-of-similarity');
  let startTime = 0;
  let timeUnstyled = 0;
  let timeStyled = 0;
  let trapClicks = 0;

  const items = [
    { text: 'Privacy Policy', isLink: true }, { text: 'Copyright 2026', isLink: false },
    { text: 'Terms of Use', isLink: true }, { text: 'All Rights Reserved', isLink: false },
    { text: 'Documentation', isLink: true }, { text: 'System Operational', isLink: false },
    { text: 'Security Audit', isLink: true }, { text: 'Version v2.4.0', isLink: false },
    { text: 'API Status', isLink: true }, { text: 'Server US-East', isLink: false },
    { text: 'Support Desk', isLink: true }, { text: 'Build Passing', isLink: false },
    { text: 'System Notice', isLink: false, isTrap: true }, { text: 'Database Active', isLink: false },
    { text: 'Node Engine', isLink: false }, { text: 'SSL Certificate', isLink: false },
    { text: 'CDN Cache', isLink: false }, { text: 'Memory 4GB', isLink: false },
    { text: 'CPU Load 12%', isLink: false }, { text: 'Latency 20ms', isLink: false },
    { text: 'Edge Nodes', isLink: false }, { text: 'Firewall Guard', isLink: false },
    { text: 'DDoS Shield', isLink: false }, { text: 'Encrypted Vault', isLink: false }
  ];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="code"></i> Law of Similarity (Visual Classing)</h3>
    <p class="sandbox-desc">Elements that share visual characteristics (blue text, underline) are perceived to have similar functions. Find and click all 6 clickable links across two styling rounds.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="sim-stage" style="width:100%;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Round 1: Unstyled Text Wall (All items look identical)</div>
        <button id="sim-start-1" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Round 1 (Unstyled)</button>
      </div>

      <div id="sim-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#sim-stage');
  const results = container.querySelector('#sim-results');

  stage.querySelector('#sim-start-1').onclick = () => {
    runRound1();
  };

  function runRound1() {
    let found = 0;
    stage.innerHTML = `
      <div style="font-size:12px; color:#ffaa00; margin-bottom:8px;">Click all 6 clickable links (<span id="sim-found">0</span>/6 found):</div>
      <div id="sim-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; background:#111; padding:12px; border-radius:8px;">
        ${items.map((item, i) => `<div class="sim-item" data-idx="${i}" style="font-size:11px; color:#aaa; padding:6px; cursor:pointer;">${item.text}</div>`).join('')}
      </div>
    `;

    startTime = performance.now();
    stage.querySelectorAll('.sim-item').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.getAttribute('data-idx'));
        if (items[idx].isLink) {
          el.style.color = '#46d369';
          el.style.fontWeight = 'bold';
          found++;
          stage.querySelector('#sim-found').textContent = found;
          if (found >= 6) {
            timeUnstyled = Math.round(performance.now() - startTime);
            runRound2();
          }
        } else {
          el.style.color = '#e50914';
        }
      };
    });
  }

  function runRound2() {
    let found = 0;
    stage.innerHTML = `
      <div style="font-size:12px; color:#46d369; margin-bottom:8px;">Round 2: Styled Links (Blue + Underline + Trap item)! (<span id="sim-found-2">0</span>/6 found):</div>
      <div id="sim-grid-2" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; background:#111; padding:12px; border-radius:8px;">
        ${items.map((item, i) => {
          const isBlue = item.isLink || item.isTrap;
          return `<div class="sim-item-2" data-idx="${i}" style="font-size:11px; color:${isBlue ? '#0084ff' : '#666'}; text-decoration:${isBlue ? 'underline' : 'none'}; padding:6px; cursor:pointer;">${item.text}</div>`;
        }).join('')}
      </div>
    `;

    startTime = performance.now();
    stage.querySelectorAll('.sim-item-2').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.getAttribute('data-idx'));
        if (items[idx].isLink) {
          el.style.color = '#46d369';
          found++;
          stage.querySelector('#sim-found-2').textContent = found;
          if (found >= 6) {
            timeStyled = Math.round(performance.now() - startTime);
            finishExperiment();
          }
        } else if (items[idx].isTrap) {
          trapClicks++;
          el.style.color = '#e50914';
        }
      };
    });
  }

  function finishExperiment() {
    stage.innerHTML = `<div style="font-size:13px; color:#46d369;">Unstyled time: ${timeUnstyled}ms | Styled time: ${timeStyled}ms | Trap clicks: <strong style="color:#e50914">${trapClicks}</strong></div>`;

    renderComparisonBars(results, {
      labelA: 'Styled Links Search Time',
      labelB: 'Unstyled Text Search Time',
      valueA: timeStyled,
      valueB: timeUnstyled,
      unitLabel: 'ms',
      title: 'Time to Locate Clickable Targets'
    });

    trial.save({ timeUnstyled, timeStyled, trapClicks });

    Trial.renderResultCard(results, {
      yours: `Styled blue links were found ${Math.round(timeUnstyled / Math.max(1, timeStyled))}× faster (${trapClicks} trap clicks on non-link styled blue)`,
      benchmark: `Consistent visual styling speeds link discovery by up to 3.5×`,
      rule: `Elements that share visual characteristics are perceived to have similar functions.`
    });
  }

  return () => trial.cleanup();
}
