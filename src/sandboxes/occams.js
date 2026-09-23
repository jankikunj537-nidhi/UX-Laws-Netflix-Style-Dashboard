import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('occams-razor');
  let deletedCount = 0;
  const TOTAL_CLUTTER = 12;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="scissors"></i> Occam's Razor (Ruthless Simplification)</h3>
    <p class="sandbox-desc">Click items on this cluttered 1990s web portal homepage to delete everything NOT essential for searching. Compare your stripped portal to Google's minimalist homepage!</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="width:100%; display:flex; justify-content:space-between; font-size:13px; color:#aaa; margin-bottom:12px;">
        <span>Deleted Clutter: <strong id="occ-count" style="color:#e50914;">0</strong> / ${TOTAL_CLUTTER} items</span>
        <button id="occ-finish-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Compare to Google Homepage</button>
      </div>

      <!-- Cluttered Portal Canvas -->
      <div id="occ-portal" style="width:100%; background:#0a0a0a; border:1px solid #333; border-radius:8px; padding:12px; display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:8px;">
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">📰 Weather Widget 🌧️</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">📈 Stock Ticker 💸</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Horoscope Today 🔮</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Sports Scores 🏈</div>
        
        <!-- Essential Search Box (Keep) -->
        <div style="grid-column:1 / -1; background:#1e1e1e; padding:12px; border:2px solid #46d369; border-radius:6px; text-align:center;">
          <span style="font-size:12px; color:#46d369; font-weight:bold;">🔍 ESSENTIAL SEARCH INPUT FIELD (KEEP THIS)</span>
          <input type="text" placeholder="Type search query..." disabled style="width:80%; margin-top:6px; padding:6px; background:#000; border:1px solid #444; color:#fff;">
        </div>

        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Celebrity Gossip 📸</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Flash Games 🎮</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Shopping Deals 🏷️</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Chat Rooms 💬</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Banner Ad 🎁</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Top Music Hits 🎵</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Daily Classifieds 🗞️</div>
        <div class="occ-item" style="background:#222; padding:8px; border-radius:4px; font-size:10px; color:#aaa; cursor:pointer;">Lottery Numbers 🎟️</div>
      </div>

      <div id="occ-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const countEl = container.querySelector('#occ-count');
  const finishBtn = container.querySelector('#occ-finish-btn');
  const results = container.querySelector('#occ-results');

  container.querySelectorAll('.occ-item').forEach(item => {
    item.onclick = () => {
      item.style.opacity = '0';
      item.style.pointerEvents = 'none';
      deletedCount++;
      countEl.textContent = deletedCount;
    };
  });

  finishBtn.onclick = () => {
    finishExperiment();
  };

  function finishExperiment() {
    const match = Math.round((deletedCount / TOTAL_CLUTTER) * 100);

    results.innerHTML = `
      <div style="font-size:14px; color:#46d369; margin-bottom:8px;">Simplification Match: <strong>${match}% Match with Google's Homepage</strong></div>
      <div style="background:#111; padding:12px; border-radius:8px; border:1px solid #46d369; font-size:12px; color:#aaa; text-align:center;">
        Google removed 100% of non-essential portal clutter to focus on a single search input, sweeping the market over Yahoo & Excite.
      </div>
    `;

    trial.save({ deletedCount, match });

    Trial.renderResultCard(results, {
      yours: `You deleted ${deletedCount}/${TOTAL_CLUTTER} unnecessary portal elements (${match}% Google match)`,
      benchmark: `Stripping visual clutter improves primary task conversion by up to 64%`,
      rule: `Simpler solutions are more likely to be correct than complex ones. Strip non-essentials.`
    });
  }

  return () => trial.cleanup();
}
