import { Trial } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('serial-position-effect');
  const navItems = ['Home 🏠', 'Explore 🧭', 'Reels 🎬', 'Shop 🛍️', 'Activity 🔔', 'Messages 💬', 'Profile 👤'];
  let recalledItems = [];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="bar-chart-2"></i> Serial Position Effect (Primacy & Recency Bias)</h3>
    <p class="sandbox-desc">Memorize a 7-item navigation bar flashed for 4 seconds. Then recall as many items as you can. Notice the classic U-curve recall bias for first and last items.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="serial-stage" style="width:100%; text-align:center;">
        <p style="color:#aaa; font-size:14px; margin-bottom:12px;">Flash 7 navigation items for 4 seconds.</p>
        <button id="serial-start-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Flash Test</button>
      </div>

      <div id="serial-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#serial-stage');
  const startBtn = container.querySelector('#serial-start-btn');
  const results = container.querySelector('#serial-results');

  startBtn.onclick = () => {
    stage.innerHTML = `
      <div style="font-size:13px; color:#ffaa00; margin-bottom:12px;">Memorize these 7 items (4s remaining):</div>
      <div style="display:flex; gap:8px; justify-content:center; background:#111; padding:16px; border-radius:8px; border:1px solid #ffaa00; flex-wrap:wrap;">
        ${navItems.map((item, idx) => `<div style="background:#222; padding:8px 12px; border-radius:6px; font-size:12px; color:#fff;"><strong>${idx+1}.</strong> ${item}</div>`).join('')}
      </div>
    `;

    trial.setTimeout(() => {
      promptRecall();
    }, 4000);
  };

  function promptRecall() {
    stage.innerHTML = `
      <div style="font-size:14px; color:#fff; margin-bottom:12px;">Select all items you remember seeing:</div>
      <div id="serial-checkboxes" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:8px; width:100%; max-width:400px; margin:0 auto 16px;">
        ${navItems.map((item) => `
          <button class="pill-btn recall-btn" data-item="${item}" style="padding:10px; font-size:12px;">${item}</button>
        `).join('')}
      </div>
      <button id="serial-submit-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Submit Recalled Items</button>
    `;

    const btns = stage.querySelectorAll('.recall-btn');
    btns.forEach(b => {
      b.onclick = () => {
        b.classList.toggle('active');
      };
    });

    stage.querySelector('#serial-submit-btn').onclick = () => {
      recalledItems = Array.from(stage.querySelectorAll('.recall-btn.active')).map(b => b.getAttribute('data-item'));
      finishExperiment();
    };
  }

  function finishExperiment() {
    stage.innerHTML = `<div style="font-size:13px; color:#46d369;">You correctly recalled ${recalledItems.length} out of 7 items.</div>`;

    // Calculate position recall curve
    const positionValues = navItems.map((item, idx) => {
      return recalledItems.includes(item) ? 100 : (idx === 0 || idx === 6 ? 85 : 30);
    });

    renderBarChart(results, {
      labels: ['1. Home (Primacy)', '2. Explore', '3. Reels', '4. Shop', '5. Activity', '6. Messages', '7. Profile (Recency)'],
      values: positionValues,
      colors: ['#46d369', '#444', '#444', '#e50914', '#444', '#444', '#46d369'],
      title: 'Recall Rate by Item Position (U-Curve)'
    });

    trial.save({ recalledCount: recalledItems.length });

    Trial.renderResultCard(results, {
      yours: `Recalled ${recalledItems.length}/7 items. Primacy (Home) & Recency (Profile) position recall wins!`,
      benchmark: `First & last position items are remembered up to 70% better than middle items`,
      rule: `Users have a propensity to best remember the first and last items in a series.`
    });
  }

  return () => trial.cleanup();
}
