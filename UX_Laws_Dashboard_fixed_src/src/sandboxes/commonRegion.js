import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('law-of-common-region');
  let bordersActive = false;
  let hasInteracted = false;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="grid"></i> Law of Common Region (Visual Enclosure)</h3>
    <p class="sandbox-desc">Elements share a visual group when enclosed within a boundary. Toggle card borders on/off to see how 1px container lines clarify feed boundaries over spatial whitespace.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:13px; color:#aaa;">Enclosure Borders / Card Backgrounds:</span>
        <button id="common-border-toggle" class="pill-btn" style="background:#222; border-color:#ffaa00; color:#ffaa00; font-weight:bold;">Toggle Borders ON</button>
      </div>

      <!-- Feed Container -->
      <div id="common-feed" style="width:100%; display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:16px; background:#111; padding:16px; border-radius:8px;">
        <div class="common-post" style="padding:12px; transition:all 0.2s;">
          <div style="font-weight:bold; font-size:12px; color:#fff;">@netflix_ux</div>
          <div style="font-size:11px; color:#aaa; margin:4px 0;">Fitts's Law Case Study</div>
          <div style="font-size:10px; color:#666;">1.2k likes · 45 comments</div>
        </div>
        <div class="common-post" style="padding:12px; transition:all 0.2s;">
          <div style="font-weight:bold; font-size:12px; color:#fff;">@apple_design</div>
          <div style="font-size:11px; color:#aaa; margin:4px 0;">iOS Corner Radius Secrets</div>
          <div style="font-size:10px; color:#666;">3.8k likes · 120 comments</div>
        </div>
        <div class="common-post" style="padding:12px; transition:all 0.2s;">
          <div style="font-weight:bold; font-size:12px; color:#fff;">@stripe_dev</div>
          <div style="font-size:11px; color:#aaa; margin:4px 0;">Gradient Mesh System</div>
          <div style="font-size:10px; color:#666;">8.4k likes · 310 comments</div>
        </div>
      </div>

      <div id="common-status" class="sandbox-score-badge" style="margin-top:16px; width:100%; text-align:center;">
        Borders OFF: Posts visually bleed together into a continuous text wall
      </div>

      <div id="common-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const toggleBtn = container.querySelector('#common-border-toggle');
  const feed = container.querySelector('#common-feed');
  const status = container.querySelector('#common-status');
  const results = container.querySelector('#common-results');

  toggleBtn.onclick = () => {
    bordersActive = !bordersActive;
    if (bordersActive) {
      toggleBtn.textContent = 'Toggle Borders OFF';
      toggleBtn.classList.add('active');
      feed.querySelectorAll('.common-post').forEach(post => {
        post.style.background = '#222';
        post.style.border = '1px solid #444';
        post.style.borderRadius = '6px';
        post.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
      });
      status.textContent = 'Borders ON: 1px enclosure line instantly establishes 3 distinct post cards! ✅';
      status.style.color = '#46d369';
    } else {
      toggleBtn.textContent = 'Toggle Borders ON';
      toggleBtn.classList.remove('active');
      feed.querySelectorAll('.common-post').forEach(post => {
        post.style.background = 'transparent';
        post.style.border = 'none';
        post.style.boxShadow = 'none';
      });
      status.textContent = 'Borders OFF: Posts visually bleed together into a continuous text wall ❌';
      status.style.color = '#ffaa00';
    }

    if (!hasInteracted) {
      hasInteracted = true;
      trial.save({ tested: true });
      Trial.renderResultCard(results, {
        yours: `Enclosure cards take precedence over spatial distance for grouping content`,
        benchmark: `Common region card boundaries reduce content parsing visual effort by 42%`,
        rule: `Elements tend to be perceived as belonging together if they share an area with a boundary.`
      });
    }
  };

  return () => trial.cleanup();
}
