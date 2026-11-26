// Grafik kanvas murni (tanpa pustaka) untuk DompetKeluarga.
// Semua fungsi menggambar di <canvas> yang sudah ada di halaman dan
// mengembalikan true bila ada piksel non-latar yang tergambar (untuk tes).
function setupCanvas(canvas, heightCss) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const h = heightCss || 220;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function clampLabel(ctx, text, x, y, w, align) {
  const tw = ctx.measureText(text).width;
  let lx = x;
  if (align === 'center') lx = Math.max(tw / 2 + 2, Math.min(w - tw / 2 - 2, x));
  else if (align === 'right') lx = Math.max(tw + 2, Math.min(w - 2, x));
  else lx = Math.max(2, Math.min(w - tw - 2, x));
  ctx.fillText(text, lx, y);
}

// Bar vertikal: [{label, value, color?}] — dipakai di Dashboard & Laporan.
export function drawBars(canvas, items, opts) {
  const o = Object.assign({ height: 220, format: (v) => String(v) }, opts || {});
  const { ctx, w, h } = setupCanvas(canvas, o.height);
  const padL = 8, padR = 8, padT = 26, padB = 28;
  const max = Math.max.apply(null, items.map((i) => i.value).concat([1]));
  const bw = (w - padL - padR) / items.length;
  const barW = Math.min(56, bw * 0.62);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  items.forEach((item, i) => {
    const x = padL + bw * i + bw / 2;
    const bh = Math.max(2, ((h - padT - padB) * item.value) / max);
    const y = h - padB - bh;
    ctx.fillStyle = item.color || '#2e7d5b';
    ctx.beginPath();
    ctx.roundRect(x - barW / 2, y, barW, bh, [5, 5, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    clampLabel(ctx, o.format(item.value), x, y - 11, w, 'center');
    ctx.fillStyle = '#475569';
    clampLabel(ctx, item.label, x, h - padB + 13, w, 'center');
  });
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(padL, h - padB + 0.5); ctx.lineTo(w - padR, h - padB + 0.5); ctx.stroke();
  return true;
}

// Bar berkelompok pemasukan vs pengeluaran per bulan.
export function drawGroupedBars(canvas, rows, opts) {
  const o = Object.assign({ height: 240 }, opts || {});
  const { ctx, w, h } = setupCanvas(canvas, o.height);
  const padL = 8, padR = 8, padT = 26, padB = 28;
  const max = Math.max.apply(null, rows.flatMap((r) => [r.income, r.spending]).concat([1]));
  const bw = (w - padL - padR) / rows.length;
  const barW = Math.min(30, bw * 0.30);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  rows.forEach((row, i) => {
    const cx = padL + bw * i + bw / 2;
    [['income', '#2e7d5b'], ['spending', '#dc2626']].forEach(([key, color], j) => {
      const bh = Math.max(2, ((h - padT - padB) * row[key]) / max);
      const x = cx + (j === 0 ? -barW - 2 : 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, h - padB - bh, barW, bh, [4, 4, 0, 0]);
      ctx.fill();
    });
    ctx.fillStyle = '#475569';
    clampLabel(ctx, row.month, cx, h - padB + 13, w, 'center');
  });
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(padL, h - padB + 0.5); ctx.lineTo(w - padR, h - padB + 0.5); ctx.stroke();
  return true;
}

// Donat sederhana untuk rincian kategori (digambar sebagai irisan busur).
export function drawDonut(canvas, items, opts) {
  const o = Object.assign({ height: 240 }, opts || {});
  const { ctx, w, h } = setupCanvas(canvas, o.height);
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 14;
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  ctx.clearRect(0, 0, w, h);
  let a = -Math.PI / 2;
  items.forEach((item) => {
    const sweep = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + sweep);
    ctx.closePath();
    ctx.fillStyle = item.color || '#94a3b8';
    ctx.fill();
    a += sweep;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Total', cx, cy - 10);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(o.centerLabel || '', cx, cy + 10);
  return true;
}

// Garis tren tabungan (saldo dana darurat + tabungan pendidikan, contoh bulanan).
export function drawLine(canvas, points, opts) {
  const o = Object.assign({ height: 200, color: '#2563eb' }, opts || {});
  const { ctx, w, h } = setupCanvas(canvas, o.height);
  const padL = 10, padR = 10, padT = 24, padB = 26;
  const max = Math.max.apply(null, points.map((p) => p.value).concat([1]));
  const min = Math.min.apply(null, points.map((p) => p.value).concat([0]));
  const span = Math.max(1, max - min);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const xs = points.map((_, i) => padL + ((w - padL - padR) * i) / Math.max(1, points.length - 1));
  const ys = points.map((p) => padT + ((h - padT - padB) * (1 - (p.value - min) / span)));
  ctx.strokeStyle = o.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  xs.forEach((x, i) => (i === 0 ? ctx.moveTo(x, ys[i]) : ctx.lineTo(x, ys[i])));
  ctx.stroke();
  points.forEach((p, i) => {
    ctx.fillStyle = o.color;
    ctx.beginPath(); ctx.arc(xs[i], ys[i], 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1f2937';
    clampLabel(ctx, p.label, xs[i], h - padB + 12, w, 'center');
  });
  return true;
}
