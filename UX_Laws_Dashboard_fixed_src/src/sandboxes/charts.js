/**
 * charts.js — Minimal Canvas Chart Library for UX Sandboxes
 * Netflix dark theme. No dependencies. Four chart types.
 */

const COLORS = {
  bg: '#181818',
  grid: 'rgba(255,255,255,0.08)',
  text: '#aaaaaa',
  label: '#ffffff',
  red: '#e50914',
  green: '#46d369',
  yellow: '#ffaa00',
  blue: '#0084ff',
};

/** Create a canvas element inside container, returns { canvas, ctx, w, h } */
function makeCanvas(container, width, height) {
  const wrapper = document.createElement('div');
  wrapper.className = 'trial-chart-container';
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  const w = Math.min(width, (container.clientWidth || width) - 32);
  const h = height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  wrapper.appendChild(canvas);
  container.appendChild(wrapper);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, w, h };
}

/** Helper: rounded rect polyfill for older browsers */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Bar Chart
 * @param {HTMLElement} container
 * @param {{ labels: string[], values: number[], colors?: string[], highlightIndex?: number, title?: string, yLabel?: string }} opts
 */
export function renderBarChart(container, { labels, values, colors: barColors, highlightIndex = -1, title = '', yLabel = '' }) {
  const barCount = labels.length;
  const { ctx, w, h } = makeCanvas(container, Math.max(280, barCount * 55), 200);
  const pad = { top: 30, right: 16, bottom: 44, left: 46 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxVal = Math.max(...values, 1) * 1.15;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  if (title) {
    ctx.fillStyle = COLORS.label;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 16);
  }

  // Grid lines + Y labels
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * (1 - i / 4)), pad.left - 6, y + 4);
  }

  // Bars
  const gap = Math.max(6, Math.min(12, cw / barCount / 4));
  const barW = Math.max(18, (cw - gap * (barCount + 1)) / barCount);

  labels.forEach((lbl, i) => {
    const x = pad.left + gap + i * (barW + gap);
    const barH = (values[i] / maxVal) * ch;
    const y = pad.top + ch - barH;
    const color = barColors ? barColors[i] : (i === highlightIndex ? COLORS.red : COLORS.green);

    ctx.fillStyle = color;
    roundedRect(ctx, x, y, barW, barH, 3);
    ctx.fill();

    // Value label on top
    ctx.fillStyle = COLORS.label;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(values[i]), x + barW / 2, y - 5);

    // X label
    ctx.fillStyle = COLORS.text;
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    // Truncate long labels
    const maxLblLen = Math.floor(barW / 5);
    const shortLbl = lbl.length > maxLblLen ? lbl.slice(0, maxLblLen) + '…' : lbl;
    ctx.fillText(shortLbl, x + barW / 2, h - pad.bottom + 14);
  });

  if (yLabel) {
    ctx.save();
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px system-ui, sans-serif';
    ctx.translate(10, pad.top + ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }
}

/**
 * Scatter Plot with optional regression line
 */
export function renderScatterPlot(container, { points, xLabel = '', yLabel = '', regressionLine = null, title = '' }) {
  const { ctx, w, h } = makeCanvas(container, 380, 210);
  const pad = { top: 28, right: 16, bottom: 42, left: 50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const maxX = Math.max(...xs, 1) * 1.1;
  const maxY = Math.max(...ys, 1) * 1.15;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  if (title) {
    ctx.fillStyle = COLORS.label;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 16);
  }

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + ch);
  ctx.lineTo(pad.left + cw, pad.top + ch);
  ctx.stroke();

  // Regression line
  if (regressionLine) {
    ctx.strokeStyle = 'rgba(229, 9, 20, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    const y1v = regressionLine.predict(0);
    const y2v = regressionLine.predict(maxX);
    const ry1 = pad.top + ch - (y1v / maxY) * ch;
    const ry2 = pad.top + ch - (y2v / maxY) * ch;
    ctx.moveTo(pad.left, Math.max(pad.top, ry1));
    ctx.lineTo(pad.left + cw, Math.max(pad.top, ry2));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Points
  points.forEach(p => {
    const x = pad.left + (p.x / maxX) * cw;
    const y = pad.top + ch - (p.y / maxY) * ch;
    ctx.fillStyle = p.color || COLORS.red;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Axis labels
  ctx.fillStyle = COLORS.text;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  if (xLabel) ctx.fillText(xLabel, pad.left + cw / 2, h - 5);
  if (yLabel) {
    ctx.save();
    ctx.translate(10, pad.top + ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }
}

/**
 * Horizontal comparison bars — two values side by side (e.g. time A vs time B)
 */
export function renderComparisonBars(container, { labelA, labelB, valueA, valueB, unitLabel = 'ms', title = '' }) {
  const maxVal = Math.max(valueA, valueB, 1);
  const div = document.createElement('div');
  div.className = 'trial-chart-container';
  div.style.flexDirection = 'column';
  div.style.padding = '16px';
  div.style.background = COLORS.bg;
  div.style.borderRadius = '8px';

  if (title) {
    div.innerHTML += `<div style="color:${COLORS.label};font:bold 12px system-ui,sans-serif;text-align:center;margin-bottom:12px;">${title}</div>`;
  }

  const makeBar = (label, value, color) => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
        <span style="color:${COLORS.text}">${label}</span>
        <span style="color:${color};font-weight:700;">${value}${unitLabel}</span>
      </div>
      <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:18px;overflow:hidden;">
        <div style="background:${color};height:100%;width:${(value / maxVal) * 100}%;border-radius:4px;transition:width 0.6s ease;"></div>
      </div>
    </div>`;

  div.innerHTML += makeBar(labelA, valueA, COLORS.green);
  div.innerHTML += makeBar(labelB, valueB, COLORS.red);
  container.appendChild(div);
}
