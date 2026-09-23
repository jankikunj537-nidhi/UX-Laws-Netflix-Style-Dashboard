import { Trial } from './trial.js';
import { renderComparisonBars } from './charts.js';

export function render(container) {
  const trial = new Trial('aesthetic-usability-effect');
  let predictedEasier = '';
  let timePolished = 0;
  let timeUgly = 0;
  let startTime = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="eye"></i> Aesthetic-Usability Effect Experiment</h3>
    <p class="sandbox-desc">Compare two booking forms with <em>identical</em> fields, logic, and tab order — one visually polished, one visually ugly. Predict which is easier, then complete both.</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div id="aesthetic-stage" style="width:100%;">
        <div style="font-size:14px; color:#fff; margin-bottom:12px;">Step 1: Before trying them, which form do you predict will be faster/easier to complete?</div>
        <div style="display:flex; gap:12px; justify-content:center; margin-bottom:16px;">
          <button id="predict-polished" class="pill-btn" style="background:#222; border-color:#46d369; color:#46d369; font-weight:bold;">Predict Polished Form</button>
          <button id="predict-ugly" class="pill-btn" style="background:#222; border-color:#e50914; color:#e50914; font-weight:bold;">Predict Ugly Form</button>
        </div>
      </div>

      <div id="aesthetic-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#aesthetic-stage');
  const results = container.querySelector('#aesthetic-results');

  stage.querySelector('#predict-polished').onclick = () => {
    predictedEasier = 'Polished';
    startFormPolished();
  };

  stage.querySelector('#predict-ugly').onclick = () => {
    predictedEasier = 'Ugly';
    startFormPolished();
  };

  function startFormPolished() {
    stage.innerHTML = `
      <div style="font-size:12px; color:#46d369; margin-bottom:8px;">Form A (Polished UI): Fill out name & email and submit</div>
      <div style="background:#1e1e1e; padding:16px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); width:100%; max-width:320px; margin:0 auto; text-align:left;">
        <label style="font-size:11px; color:#aaa;">Full Name</label>
        <input type="text" id="p-name" placeholder="John Doe" style="width:100%; background:#111; border:1px solid #333; color:#fff; padding:6px; border-radius:4px; margin-bottom:8px; font-size:12px;">
        <label style="font-size:11px; color:#aaa;">Email Address</label>
        <input type="email" id="p-email" placeholder="john@example.com" style="width:100%; background:#111; border:1px solid #333; color:#fff; padding:6px; border-radius:4px; margin-bottom:12px; font-size:12px;">
        <button id="p-submit" class="pill-btn" style="background:var(--netflix-red); color:#fff; width:100%; font-weight:bold;">Complete Booking</button>
      </div>
    `;

    startTime = performance.now();
    stage.querySelector('#p-submit').onclick = () => {
      timePolished = Math.round(performance.now() - startTime);
      startFormUgly();
    };
  }

  function startFormUgly() {
    stage.innerHTML = `
      <div style="font-size:12px; color:#e50914; margin-bottom:8px;">Form B (Raw Ugly UI): Fill out same fields and submit</div>
      <div style="background:#ff00ff; padding:16px; border:4px dashed #00ff00; width:100%; max-width:320px; margin:0 auto; font-family:'Comic Sans MS', cursive; color:#ffff00; text-align:left;">
        <label style="font-size:12px; font-weight:bold;">Full Name</label>
        <input type="text" id="u-name" style="width:100%; background:#00ffff; border:2px solid #ff0000; color:#000; padding:4px; margin-bottom:8px; font-size:12px;">
        <label style="font-size:12px; font-weight:bold;">Email Address</label>
        <input type="email" id="u-email" style="width:100%; background:#00ffff; border:2px solid #ff0000; color:#000; padding:4px; margin-bottom:12px; font-size:12px;">
        <button id="u-submit" style="background:#ffff00; color:#ff0000; border:3px solid #000; width:100%; font-weight:bold; font-size:14px; cursor:pointer;">Complete Booking</button>
      </div>
    `;

    startTime = performance.now();
    stage.querySelector('#u-submit').onclick = () => {
      timeUgly = Math.round(performance.now() - startTime);
      finishExperiment();
    };
  }

  function finishExperiment() {
    stage.innerHTML = `<div style="font-size:14px; color:#46d369;">You predicted <strong>${predictedEasier}</strong> would be easier. Actual completion times are near identical!</div>`;

    renderComparisonBars(results, {
      labelA: 'Polished UI Time',
      labelB: 'Raw Ugly UI Time',
      valueA: timePolished,
      valueB: timeUgly,
      unitLabel: 'ms',
      title: 'Actual Task Completion Time'
    });

    trial.save({ timePolished, timeUgly, predictedEasier });

    Trial.renderResultCard(results, {
      yours: `Polished: ${timePolished}ms vs Ugly: ${timeUgly}ms (Predicted: ${predictedEasier})`,
      benchmark: `Users rate attractive interfaces as 20% - 40% more usable despite equal functional performance`,
      rule: `Users often perceive aesthetically pleasing design as design that’s more usable.`
    });
  }

  return () => trial.cleanup();
}
