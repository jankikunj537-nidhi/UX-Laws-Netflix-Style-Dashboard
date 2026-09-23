/**
 * trial.js — Shared Trial Engine for UX Law Sandboxes
 * Timer, event capture, localStorage persistence, result cards, cleanup lifecycle.
 */

export class Trial {
  constructor(lawId) {
    this.lawId = lawId;
    this.startTimestamp = 0;
    this.events = [];
    this.currentRound = 0;
    this.totalRounds = 1;
    this._timers = [];
    this._intervals = [];
    this._listeners = [];
    this._animFrames = [];
  }

  /** Start the timer */
  start() {
    this.startTimestamp = performance.now();
    return this;
  }

  /** Stop the timer, return elapsed ms */
  stop() {
    const elapsed = Math.round(performance.now() - this.startTimestamp);
    this.startTimestamp = 0;
    return { elapsed };
  }

  /** Get current elapsed without stopping */
  elapsed() {
    if (!this.startTimestamp) return 0;
    return Math.round(performance.now() - this.startTimestamp);
  }

  /** Log an event with type and data */
  logEvent(type, data = {}) {
    this.events.push({ type, data, time: performance.now() });
  }

  /** Set round info for multi-round experiments */
  setRound(current, total) {
    this.currentRound = current;
    this.totalRounds = total;
  }

  /** Save results to localStorage under this lawId */
  save(results) {
    const stored = JSON.parse(localStorage.getItem('ux-sandbox-results') || '{}');
    stored[this.lawId] = { ...results, timestamp: Date.now() };
    localStorage.setItem('ux-sandbox-results', JSON.stringify(stored));
  }

  /** Get saved results for one law or all */
  static getResults(lawId) {
    const stored = JSON.parse(localStorage.getItem('ux-sandbox-results') || '{}');
    return lawId ? stored[lawId] : stored;
  }

  /** Aggregate completion stats across all sandboxed laws */
  static getAggregateScore(total = 30) {
    const stored = JSON.parse(localStorage.getItem('ux-sandbox-results') || '{}');
    const completed = Object.keys(stored).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }

  /** Render the standard 3-line result card: Your result / Benchmark / Rule */
  static renderResultCard(container, { yours, benchmark, rule }) {
    const existing = container.querySelector('.trial-result-card');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.className = 'trial-result-card';
    card.innerHTML = `
      <div class="trial-result-row trial-result-yours">
        <span class="trial-result-label">📊 Your Result</span>
        <span class="trial-result-value">${yours}</span>
      </div>
      <div class="trial-result-row trial-result-benchmark">
        <span class="trial-result-label">📏 The Benchmark</span>
        <span class="trial-result-value">${benchmark}</span>
      </div>
      <div class="trial-result-row trial-result-rule">
        <span class="trial-result-label">📐 The Rule</span>
        <span class="trial-result-value">${rule}</span>
      </div>
    `;
    container.appendChild(card);
    return card;
  }

  // --- Managed resource helpers for auto-cleanup ---

  setTimeout(fn, ms) {
    const id = window.setTimeout(fn, ms);
    this._timers.push(id);
    return id;
  }

  setInterval(fn, ms) {
    const id = window.setInterval(fn, ms);
    this._intervals.push(id);
    return id;
  }

  requestAnimationFrame(fn) {
    const id = window.requestAnimationFrame(fn);
    this._animFrames.push(id);
    return id;
  }

  addListener(el, event, fn, options) {
    el.addEventListener(event, fn, options);
    this._listeners.push({ el, event, fn, options });
  }

  /** Clean up all managed timers and listeners */
  cleanup() {
    this._timers.forEach(id => clearTimeout(id));
    this._intervals.forEach(id => clearInterval(id));
    this._animFrames.forEach(id => cancelAnimationFrame(id));
    this._listeners.forEach(({ el, event, fn, options }) => {
      try { el.removeEventListener(event, fn, options); } catch (e) { /* element may be gone */ }
    });
    this._timers = [];
    this._intervals = [];
    this._animFrames = [];
    this._listeners = [];
    this.events = [];
  }
}

/**
 * Confetti burst animation for Peak-End Rule etc.
 * Spawns N particles inside `parentEl` that fall and fade.
 */
export function confettiBurst(parentEl, count = 60) {
  const colors = ['#e50914', '#46d369', '#ffaa00', '#0084ff', '#ff6b81', '#ffd700', '#7c4dff'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 6;
    p.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      background:${colors[i % colors.length]};
      left:${Math.random() * 100}%; top:${-10 - Math.random() * 40}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events:none; opacity:1; z-index:100;
      animation: confettiFall ${1.2 + Math.random() * 1.5}s ease-out forwards;
      animation-delay: ${Math.random() * 0.3}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    frag.appendChild(p);
  }
  parentEl.style.position = 'relative';
  parentEl.style.overflow = 'hidden';
  parentEl.appendChild(frag);
  setTimeout(() => {
    parentEl.querySelectorAll('[style*="confettiFall"]').forEach(el => el.remove());
  }, 3500);
}
