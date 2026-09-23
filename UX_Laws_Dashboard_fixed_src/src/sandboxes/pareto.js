import { Trial } from './trial.js';

export function render(container) {
  const trial = new Trial('pareto-principle');
  let selected = [];
  const MAX_SELECT = 8;

  const tools = [
    { name: 'Bold', core: true }, { name: 'Italic', core: true }, { name: 'Font Size', core: true },
    { name: 'Color', core: true }, { name: 'Align Left', core: true }, { name: 'Align Center', core: true },
    { name: 'Save', core: true }, { name: 'Undo', core: true },
    { name: 'Strikethrough', core: false }, { name: 'Subscript', core: false }, { name: 'Superscript', core: false },
    { name: 'Insert Table', core: false }, { name: 'Word Count', core: false }, { name: 'Page Break', core: false },
    { name: 'Footnote', core: false }, { name: 'Macro Record', core: false }, { name: 'Bookmark', core: false },
    { name: 'Watermark', core: false }, { name: 'Header/Footer', core: false }, { name: 'Mail Merge', core: false },
    { name: 'Translate', core: false }, { name: 'Thesaurus', core: false }, { name: 'Spell Check', core: false },
    { name: 'Track Changes', core: false }, { name: 'Compare Docs', core: false }, { name: 'Encrypt PDF', core: false },
    { name: 'XML Import', core: false }, { name: 'LaTeX Syntax', core: false }, { name: 'Line Spacing', core: false },
    { name: 'Borders', core: false }, { name: 'Shading', core: false }, { name: 'Columns', core: false },
    { name: 'Orientation', core: false }, { name: 'Margins', core: false }, { name: 'Table of Contents', core: false },
    { name: 'Index', core: false }, { name: 'Citation', core: false }, { name: 'Cross Ref', core: false },
    { name: 'Capitals', core: false }, { name: 'Sort Text', core: false }
  ];

  container.innerHTML = `
    <h3 class="sandbox-title"><i data-feather="pie-chart"></i> Pareto Principle (80/20 Rule)</h3>
    <p class="sandbox-desc">80% of user value comes from 20% of features. From this 40-tool bar, select the 8 core features (20%) you'd keep on the top toolbar. The remaining 32 go into "More."</p>

    <div class="sandbox-demo-box" style="min-height:300px;">
      <div style="width:100%; display:flex; justify-content:space-between; font-size:13px; color:#aaa; margin-bottom:12px;">
        <span>Selected Top Bar Tools: <strong id="par-count" style="color:#ffaa00;">0</strong> / 8</span>
        <button id="par-simulate-btn" class="pill-btn" style="background:var(--netflix-red); color:#fff; font-weight:bold;">Simulate 100 User Tasks</button>
      </div>

      <div id="par-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:6px; width:100%; max-height:200px; overflow-y:auto; padding:4px;">
        ${tools.map((t, i) => `<button class="pill-btn par-tool" data-idx="${i}" style="font-size:10px; padding:6px 4px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${t.name}</button>`).join('')}
      </div>

      <div id="par-results" style="width:100%; margin-top:16px;"></div>
    </div>
  `;

  const countEl = container.querySelector('#par-count');
  const simBtn = container.querySelector('#par-simulate-btn');
  const results = container.querySelector('#par-results');

  container.querySelectorAll('.par-tool').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      if (selected.includes(idx)) {
        selected = selected.filter(i => i !== idx);
        btn.classList.remove('active');
      } else {
        if (selected.length < MAX_SELECT) {
          selected.push(idx);
          btn.classList.add('active');
        }
      }
      countEl.textContent = selected.length;
    };
  });

  simBtn.onclick = () => {
    finishExperiment();
  };

  function finishExperiment() {
    let coreHits = 0;
    selected.forEach(idx => {
      if (tools[idx].core) coreHits++;
    });

    const coverage = Math.round((coreHits / 8) * 80 + 15);

    results.innerHTML = `
      <div style="font-size:14px; color:#46d369; margin-bottom:8px;">Task Coverage Simulation: Your 8 chosen tools covered <strong>${coverage}% of 100 user workflows!</strong></div>
      <div style="background:#111; padding:12px; border-radius:8px; font-size:11px; color:#aaa; text-align:left;">
        <strong style="color:#ffaa00;">Microsoft Office Ribbon Case Study:</strong><br>
        Microsoft telemetry proved 80% of Word usage was driven by just 20% of commands (Bold, Font, Save, Paste). Surfacing those 20% in the top Ribbon revolutionized doc editing.
      </div>
    `;

    trial.save({ selected, coverage });

    Trial.renderResultCard(results, {
      yours: `Your 20% tool selections (8/40 tools) covered ${coverage}% of total user task volume`,
      benchmark: `80% of product engagement is driven by the top 20% core features`,
      rule: `Identify and polish the core 20% of features that deliver 80% of user value.`
    });
  }

  return () => trial.cleanup();
}
