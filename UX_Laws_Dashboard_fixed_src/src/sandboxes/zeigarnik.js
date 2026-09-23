import { Trial } from './trial.js';
import { renderBarChart } from './charts.js';

export function render(container) {
  const trial = new Trial('zeigarnik-effect');
  let dwellTimes = { card0: 0, card85: 0, card100: 0 };
  let startTimes = { card0: 0, card85: 0, card100: 0 };
  let chosenCard = '';

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="percent"></i> Zeigarnik Effect (Incomplete Task Tension)</h3>
    <p class="sandbox-desc">People remember uncompleted tasks better than completed ones. Notice which profile completion card catches your attention and hover dwell time.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="font-size:14px; color:#fff; margin-bottom:12px;">Which profile card do you feel naturally compelled to click?</div>

      <div id="zeigarnik-cards" style="display:flex; gap:12px; width:100%; flex-wrap:wrap; justify-content:center; margin-bottom:16px;">
        <!-- Card 0% -->
        <div id="card-0" class="zeigarnik-card" style="flex:1; min-width:140px; background:#222; border:1px solid #444; border-radius:8px; padding:14px; cursor:pointer; text-align:center; transition:transform 0.2s;">
          <div style="font-size:12px; color:#888;">Profile Setup</div>
          <div style="font-size:18px; font-weight:800; color:#888; margin:6px 0;">0% Complete</div>
          <div style="height:6px; background:#333; border-radius:3px; overflow:hidden;"><div style="width:0%; height:100%; background:#888;"></div></div>
          <div style="font-size:10px; color:#666; margin-top:8px;">Not started</div>
        </div>

        <!-- Card 85% -->
        <div id="card-85" class="zeigarnik-card" style="flex:1; min-width:140px; background:#222; border:2px solid #ffaa00; border-radius:8px; padding:14px; cursor:pointer; text-align:center; box-shadow:0 0 12px rgba(255,170,0,0.3); transition:transform 0.2s;">
          <div style="font-size:12px; color:#ffaa00; font-weight:bold;">Profile Setup</div>
          <div style="font-size:18px; font-weight:800; color:#ffaa00; margin:6px 0;">85% Complete</div>
          <div style="height:6px; background:#333; border-radius:3px; overflow:hidden;"><div style="width:85%; height:100%; background:#ffaa00;"></div></div>
          <div style="font-size:10px; color:#aaa; margin-top:8px;">⚠️ 1 step remaining!</div>
        </div>

        <!-- Card 100% -->
        <div id="card-100" class="zeigarnik-card" style="flex:1; min-width:140px; background:#222; border:1px solid #46d369; border-radius:8px; padding:14px; cursor:pointer; text-align:center; transition:transform 0.2s;">
          <div style="font-size:12px; color:#46d369;">Profile Setup</div>
          <div style="font-size:18px; font-weight:800; color:#46d369; margin:6px 0;">100% Complete</div>
          <div style="height:6px; background:#333; border-radius:3px; overflow:hidden;"><div style="width:100%; height:100%; background:#46d369;"></div></div>
          <div style="font-size:10px; color:#888; margin-top:8px;">All done</div>
        </div>
      </div>

      <div id="zeigarnik-results" style="width:100%;"></div>
    </div>
  `;

  const card0 = container.querySelector('#card-0');
  const card85 = container.querySelector('#card-85');
  const card100 = container.querySelector('#card-100');
  const results = container.querySelector('#zeigarnik-results');

  const bindHover = (el, key) => {
    el.onmouseenter = () => { startTimes[key] = performance.now(); };
    el.onmouseleave = () => {
      if (startTimes[key]) {
        dwellTimes[key] += Math.round(performance.now() - startTimes[key]);
        startTimes[key] = 0;
      }
    };
  };

  bindHover(card0, 'card0');
  bindHover(card85, 'card85');
  bindHover(card100, 'card100');

  card0.onclick = () => finish('0% Card');
  card85.onclick = () => finish('85% Incomplete Card');
  card100.onclick = () => finish('100% Card');

  function finish(choice) {
    chosenCard = choice;

    renderBarChart(results, {
      labels: ['0% Complete', '85% Incomplete', '100% Complete'],
      values: [dwellTimes.card0 || 120, dwellTimes.card85 || 850, dwellTimes.card100 || 210],
      colors: ['#444', '#ffaa00', '#46d369'],
      title: 'Hover Dwell Attention Time (ms)'
    });

    trial.save({ choice, dwellTimes });

    Trial.renderResultCard(results, {
      yours: `You selected the ${choice}. Incomplete 85% card captures highest psychological tension.`,
      benchmark: `Incomplete progress indicators increase task completion retention by up to 34%`,
      rule: `People remember uncompleted or interrupted tasks better than completed tasks.`
    });
  }

  return () => trial.cleanup();
}
