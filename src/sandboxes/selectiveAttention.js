import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('selective-attention');

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="eye-off"></i> Selective Attention: Banner Blindness</h3>
    <p class="sandbox-desc">Focus on the task. Count how many blue circles appear on screen in 6 seconds — nothing else matters right now.</p>
    <div class="sandbox-demo-box" id="sa-box" style="min-height:240px;">
      <button class="pill-btn" id="sa-start" style="width:100%; background:var(--netflix-red); border-color:var(--netflix-red); color:#fff; font-weight:700; padding:12px;">Start Counting Task</button>
    </div>
  `;

  const box = container.querySelector('#sa-box');
  const startBtn = box.querySelector('#sa-start');
  let blueCount = 0;
  let bannerText = null;

  trial.addListener(startBtn, 'click', begin);

  function begin() {
    box.innerHTML = `
      <p style="text-align:center; color:#ffaa00; font-weight:700; margin-bottom:8px;">Count the blue circles!</p>
      <div id="sa-field" style="position:relative; height:180px; background:#111; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);"></div>
    `;
    const field = box.querySelector('#sa-field');

    // A banner-ad-style distractor placed in a classic ignored zone (top of content area)
    const banner = document.createElement('div');
    bannerText = 'SPECIAL OFFER: 30% OFF TODAY ONLY';
    banner.textContent = bannerText;
    banner.style.cssText = `position:absolute; top:0; left:0; right:0; background:#ff6b00; color:#fff; font-size:11px; font-weight:700; text-align:center; padding:4px; z-index:2;`;
    field.appendChild(banner);

    blueCount = 0;
    const spawn = trial.setInterval(() => {
      const dot = document.createElement('div');
      const isBlue = Math.random() > 0.4;
      if (isBlue) blueCount++;
      const size = 16 + Math.random() * 10;
      dot.style.cssText = `position:absolute; width:${size}px; height:${size}px; border-radius:50%;
        background:${isBlue ? '#0084ff' : '#666'};
        left:${Math.random() * 85}%; top:${20 + Math.random() * 70}%;`;
      field.appendChild(dot);
      trial.setTimeout(() => dot.remove(), 900);
    }, 350);

    trial.setTimeout(() => {
      clearInterval(spawn);
      askQuestions();
    }, 6000);
  }

  function askQuestions() {
    box.innerHTML = `
      <p style="color:#fff; margin-bottom:10px;">How many blue circles did you count?</p>
      <input id="sa-guess" type="number" style="width:100%; padding:10px; background:#111; border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:#fff; margin-bottom:12px;">
      <p style="color:#fff; margin-bottom:10px;">Bonus: what did the orange banner at the top say?</p>
      <input id="sa-banner" type="text" placeholder="I don't remember / type what you recall" style="width:100%; padding:10px; background:#111; border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:#fff;">
      <button class="pill-btn" id="sa-submit" style="margin-top:12px; width:100%;">Submit</button>
    `;
    const submitBtn = box.querySelector('#sa-submit');
    trial.addListener(submitBtn, 'click', () => {
      const guess = Number(box.querySelector('#sa-guess').value) || 0;
      const bannerGuess = box.querySelector('#sa-banner').value.trim().toLowerCase();
      const rememberedBanner = bannerGuess.length > 4 && bannerText.toLowerCase().includes(bannerGuess.split(' ')[0]);
      finish(guess, rememberedBanner);
    });
  }

  function finish(guess, rememberedBanner) {
    box.innerHTML = `<h4 style="color:#46d369;">Results</h4>`;
    trial.save({ guess, actual: blueCount, rememberedBanner });
    Trial.renderResultCard(box, {
      yours: `You guessed ${guess}, actual count was ${blueCount}. Banner: "${rememberedBanner ? 'Noticed it!' : 'Missed or forgot it'}"`,
      benchmark: 'Most people focused on a counting task fail to notice or recall banner-style content, even when it\'s in plain sight',
      rule: 'When focused on a task, people filter out stimuli — like ads or banners — that seem irrelevant to that task ("banner blindness").'
    });
  }

  return () => trial.cleanup();
}
