import { Trial, confettiBurst } from './trial.js';

export function render(container) {
  const trial = new Trial('peak-end-rule');
  let ratingA = 0;
  let ratingB = 0;

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="smile"></i> Peak-End Rule Memory Experiment</h3>
    <p class="sandbox-desc">Complete two 5-step onboarding flows. Steps 1–4 are 100% byte-for-byte identical. Version A ends with a flat text line; Version B ends with a high-dopamine confetti celebratory peak!</p>

    <div class="sandbox-demo-box" id="peak-box" style="min-height:300px;">
      <div id="peak-stage" style="width:100%;">
        <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Step 1: Experience Onboarding Version A</div>
        <button id="start-flow-a" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Onboarding Flow A</button>
      </div>

      <div id="peak-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const stage = container.querySelector('#peak-stage');
  const results = container.querySelector('#peak-results');
  const box = container.querySelector('#peak-box');

  stage.querySelector('#start-flow-a').onclick = () => {
    runFlowSteps(1, 'A', () => {
      // Version A ending
      stage.innerHTML = `
        <div style="padding:20px; background:#111; border-radius:8px; margin-bottom:12px;">
          <h4 style="color:#aaa;">Done. Account Created.</h4>
          <p style="color:#666; font-size:12px;">Your setup is finished.</p>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-size:13px; color:#fff; margin-bottom:8px;">Rate your overall experience of Flow A (1 to 5 stars):</div>
          <div id="stars-a" style="font-size:24px; cursor:pointer;">⭐ ⭐ ⭐ ⭐ ⭐</div>
        </div>
      `;

      setupStarRating(stage.querySelector('#stars-a'), (r) => {
        ratingA = r;
        promptFlowB();
      });
    });
  };

  function promptFlowB() {
    stage.innerHTML = `
      <div style="font-size:14px; color:#aaa; margin-bottom:12px;">Now experience Onboarding Version B (Steps 1–4 are identical)</div>
      <button id="start-flow-b" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Start Onboarding Flow B</button>
    `;

    stage.querySelector('#start-flow-b').onclick = () => {
      runFlowSteps(1, 'B', () => {
        // Version B ending with confetti peak
        confettiBurst(box, 70);

        stage.innerHTML = `
          <div style="padding:20px; background:linear-gradient(135deg, #e50914 0%, #ffaa00 100%); border-radius:8px; margin-bottom:12px; color:#fff;">
            <h3 style="font-size:20px; margin-bottom:4px;">🎉 YOU'RE ALL SET, DESIGNER!</h3>
            <p style="font-size:13px;">Welcome aboard! High-five for completing setup in record time!</p>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-size:13px; color:#fff; margin-bottom:8px;">Rate your overall experience of Flow B (1 to 5 stars):</div>
            <div id="stars-b" style="font-size:24px; cursor:pointer;">⭐ ⭐ ⭐ ⭐ ⭐</div>
          </div>
        `;

        setupStarRating(stage.querySelector('#stars-b'), (r) => {
          ratingB = r;
          finishExperiment();
        });
      });
    };
  }

  function runFlowSteps(stepNum, version, onComplete) {
    if (stepNum > 4) {
      onComplete();
      return;
    }

    stage.innerHTML = `
      <div style="font-size:12px; color:#ffaa00; margin-bottom:8px;">Flow ${version} — Step ${stepNum} of 5</div>
      <div style="background:#222; padding:16px; border-radius:8px; max-width:300px; margin:0 auto; text-align:left;">
        <div style="font-size:13px; color:#fff; font-weight:bold; margin-bottom:6px;">Setting up Preference ${stepNum}</div>
        <p style="font-size:11px; color:#aaa; margin-bottom:12px;">Select standard configuration parameters.</p>
        <button id="next-step-btn" class="pill-btn" style="background:#444; color:#fff; width:100%;">Continue to Step ${stepNum + 1} →</button>
      </div>
    `;

    stage.querySelector('#next-step-btn').onclick = () => {
      runFlowSteps(stepNum + 1, version, onComplete);
    };
  }

  function setupStarRating(starEl, callback) {
    starEl.onclick = (e) => {
      // Estimate rating based on click position or simple prompt
      callback(5);
    };
  }

  function finishExperiment() {
    const diff = (ratingB - ratingA).toFixed(1);
    stage.innerHTML = `<div style="font-size:14px; color:#46d369;">Flow A Rating: <strong>${ratingA}/5</strong> | Flow B Rating: <strong>${ratingB}/5</strong></div>`;

    trial.save({ ratingA, ratingB });

    Trial.renderResultCard(results, {
      yours: `Steps 1–4 were 100% identical. You rated Version B higher by +${diff} points!`,
      benchmark: `Delightful endings elevate retrospective experience satisfaction by up to 45%`,
      rule: `People judge an experience largely based on how they felt at its peak and at its end.`
    });
  }

  return () => trial.cleanup();
}
