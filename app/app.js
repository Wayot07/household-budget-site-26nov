// DompetKeluarga — router + interaksi. Satu berkas untuk semua tampilan:
// Dashboard, Transaksi, Anggaran, Tagihan, Tabungan, Laporan.
// Data tersimpan di localStorage (kunci dompetkeluarga-v1) sehingga perubahan
// pengguna (tambah/ubah/hapus transaksi, tandai tagihan lunas, isi tabungan)
// bertahan saat halaman dimuat ulang; semua total dan grafik ikut berubah.
import {
  MONTH_LABEL, HOUSEHOLD, CATEGORIES, INCOME_SOURCES, DEFAULT_BUDGETS,
  DEFAULT_TRANSACTIONS, DEFAULT_BILLS, DEFAULT_GOALS, MONTHLY_TREND,
  categoryById, formatRp, formatDateShort,
} from './data.js';
import { drawBars, drawGroupedBars, drawDonut, drawLine } from './charts.js';

const STORE_KEY = 'dompetkeluarga-v1';
const root = document.getElementById('app');

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.transactions) && Array.isArray(s.budgets)) return s;
    }
  } catch (e) { /* localStorage tidak tersedia: pakai data contoh */ }
  return {
    transactions: clone(DEFAULT_TRANSACTIONS),
    budgets: clone(DEFAULT_BUDGETS),
    bills: clone(DEFAULT_BILLS),
    goals: clone(DEFAULT_GOALS),
  };
}

let store = loadStore();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* abaikan */ }
}

function totals() {
  let income = 0, spending = 0;
  for (const t of store.transactions) {
    if (t.type === 'income') income += t.amount;
    else spending += t.amount;
  }
  return { income, spending, savings: income - spending };
}

function spentByCategory() {
  const m = {};
  for (const c of CATEGORIES) m[c.id] = 0;
  for (const t of store.transactions) {
    if (t.type === 'expense' && m[t.category] !== undefined) m[t.category] += t.amount;
  }
  return m;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function navActive(route) {
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#/' + route);
  });
}

function kpiCard(label, value, sub, tone) {
  return `<div class="kpi ${tone || ''}"><p class="kpi-label">${label}</p>
    <p class="kpi-value">${value}</p><p class="kpi-sub">${sub}</p></div>`;
}

// ---------------- Dashboard ----------------
function viewDashboard() {
  const t = totals();
  const spent = spentByCategory();
  const budgetTotal = store.budgets.reduce((s, b) => s + b.limit, 0);
  const upcoming = store.bills.filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due));
  const unpaidTotal = upcoming.reduce((s, b) => s + b.amount, 0);
  const recent = [...store.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const pct = budgetTotal ? Math.round((t.spending / budgetTotal) * 100) : 0;
  root.innerHTML = `
  <section class="page-head">
    <h1>Dasbor — ${MONTH_LABEL}</h1>
    <p>${esc(HOUSEHOLD.name)} · ${esc(HOUSEHOLD.city)} · ${esc(HOUSEHOLD.members)}</p>
  </section>
  <div class="kpi-grid">
    ${kpiCard('Pemasukan bulan ini', formatRp(t.income), INCOME_SOURCES.length + ' sumber pemasukan', 'good')}
    ${kpiCard('Pengeluaran bulan ini', formatRp(t.spending), pct + '% dari total anggaran ' + formatRp(budgetTotal), t.spending > budgetTotal ? 'bad' : '')}
    ${kpiCard('Sisa / tabungan', formatRp(t.savings), 'Pemasukan − pengeluaran', t.savings >= 0 ? 'good' : 'bad')}
    ${kpiCard('Tagihan belum lunas', formatRp(unpaidTotal), upcoming.length + ' tagihan menunggu', upcoming.length ? 'warn' : 'good')}
  </div>
  <div class="grid-2">
    <section class="card">
      <h2>Anggaran vs pengeluaran</h2>
      <p class="muted">Per kategori, bulan ${MONTH_LABEL}. Hijau = masih dalam batas, merah = lewat batas.</p>
      <canvas id="chart-budget" height="220" aria-label="Grafik anggaran vs pengeluaran"></canvas>
      <div class="bar-list" id="budget-bars"></div>
    </section>
    <section class="card">
      <h2>Tagihan segera jatuh tempo</h2>
      <ul class="bill-mini">
        ${upcoming.slice(0, 4).map((b) => `<li><span><strong>${esc(b.label)}</strong><br><span class="muted">Jatuh tempo ${formatDateShort(b.due)}</span></span><strong>${formatRp(b.amount)}</strong></li>`).join('') || '<li>Semua tagihan sudah lunas. 🎉</li>'}
      </ul>
      <p><a class="btn" href="#/tagihan">Lihat semua tagihan →</a></p>
      <h2 class="mt">Transaksi terbaru</h2>
      <ul class="tx-mini">
        ${recent.map((tr) => `<li><span>${esc(tr.label)}<br><span class="muted">${formatDateShort(tr.date)} · ${esc(categoryById(tr.category).label)}</span></span><strong class="${tr.type === 'income' ? 'in' : 'out'}">${tr.type === 'income' ? '+' : '−'}${formatRp(tr.amount)}</strong></li>`).join('')}
      </ul>
      <p><a class="btn" href="#/transaksi">Semua transaksi →</a></p>
    </section>
  </div>
  <section class="card tip">
    <h2>💡 Tips bulan ini</h2>
    <p>Belanja dapur sudah ${formatRp(spent.dapur)} dari anggaran ${formatRp(store.budgets.find((b) => b.category === 'dapur').limit)}.
    Sisa ${formatRp(Math.max(0, store.budgets.find((b) => b.category === 'dapur').limit - spent.dapur))} cukup untuk 4 hari ke depan
    bila belanja harian dijaga di bawah Rp150.000. ${t.savings > 0 ? 'Sisa uang bulan ini ' + formatRp(t.savings) + ' bisa langsung dipindah ke dana darurat.' : 'Pengeluaran sudah melebihi pemasukan — cek kategori hiburan dan makan luar.'}</p>
    <p><button class="btn btn-ghost" id="reset-data">Kembalikan data contoh</button></p>
  </section>`;
  const bars = store.budgets.map((b) => {
    const c = categoryById(b.category);
    const s = spent[b.category] || 0;
    return { label: c.label.split(' ')[0], value: s, color: s > b.limit ? '#dc2626' : '#2e7d5b' };
  });
  drawBars(document.getElementById('chart-budget'), bars, { height: 220, format: (v) => 'Rp' + (v / 1000000).toFixed(1) + ' jt' });
  document.getElementById('budget-bars').innerHTML = store.budgets.map((b) => {
    const c = categoryById(b.category);
    const s = spent[b.category] || 0;
    const p = b.limit ? Math.min(100, Math.round((s / b.limit) * 100)) : 0;
    return `<div class="bar-row"><span>${c.icon} ${esc(c.label)}</span>
      <div class="bar-track"><div class="bar-fill ${s > b.limit ? 'over' : ''}" style="width:${p}%"></div></div>
      <span>${formatRp(s)} / ${formatRp(b.limit)}</span></div>`;
  }).join('');
  document.getElementById('reset-data').addEventListener('click', () => {
    store = { transactions: clone(DEFAULT_TRANSACTIONS), budgets: clone(DEFAULT_BUDGETS), bills: clone(DEFAULT_BILLS), goals: clone(DEFAULT_GOALS) };
    save(); render();
  });
}

// ---------------- Transaksi ----------------
function txRow(tr, editing) {
  if (editing) {
    return `<tr data-id="${tr.id}">
      <td><input type="date" class="edit-date" value="${tr.date}"></td>
      <td><input type="text" class="edit-label" value="${esc(tr.label)}"></td>
      <td><select class="edit-cat">${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === tr.category ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></td>
      <td><select class="edit-type"><option value="expense" ${tr.type === 'expense' ? 'selected' : ''}>Pengeluaran</option><option value="income" ${tr.type === 'income' ? 'selected' : ''}>Pemasukan</option></select></td>
      <td><input type="number" class="edit-amount" min="0" step="1000" value="${tr.amount}"></td>
      <td><button class="btn btn-small" data-save-tx="${tr.id}">Simpan</button> <button class="btn btn-small btn-ghost" data-cancel-edit>Batal</button></td>
    </tr>`;
  }
  const c = categoryById(tr.category);
  return `<tr data-id="${tr.id}">
    <td>${formatDateShort(tr.date)}</td>
    <td>${esc(tr.label)}</td>
    <td>${c.icon} ${esc(c.label)}</td>
    <td>${tr.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
    <td class="${tr.type === 'income' ? 'in' : 'out'}">${tr.type === 'income' ? '+' : '−'}${formatRp(tr.amount)}</td>
    <td><button class="btn btn-small" data-edit-tx="${tr.id}">Ubah</button> <button class="btn btn-small btn-danger" data-del-tx="${tr.id}">Hapus</button></td>
  </tr>`;
}

let editingTxId = null;
function viewTransactions() {
  const t = totals();
  root.innerHTML = `
  <section class="page-head"><h1>Transaksi</h1>
  <p>Semua pemasukan dan pengeluaran ${MONTH_LABEL}. Menambah, mengubah, atau menghapus transaksi langsung mengubah total dan grafik di seluruh situs.</p></section>
  <div class="kpi-grid">
    ${kpiCard('Total pemasukan', formatRp(t.income), store.transactions.filter((x) => x.type === 'income').length + ' pemasukan', 'good')}
    ${kpiCard('Total pengeluaran', formatRp(t.spending), store.transactions.filter((x) => x.type === 'expense').length + ' pengeluaran', '')}
    ${kpiCard('Selisih', formatRp(t.savings), 'Pemasukan − pengeluaran', t.savings >= 0 ? 'good' : 'bad')}
  </div>
  <section class="card">
    <h2>Tambah transaksi</h2>
    <form id="tx-form" class="form-grid">
      <label>Tanggal<input type="date" id="tx-date" value="2026-11-26" required></label>
      <label>Keterangan<input type="text" id="tx-label" placeholder="cth: Belanja mingguan" required maxlength="80"></label>
      <label>Kategori<select id="tx-cat">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Jenis<select id="tx-type"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
      <label>Jumlah (Rp)<input type="number" id="tx-amount" min="1000" step="1000" placeholder="150000" required></label>
      <button class="btn btn-primary" type="submit">+ Tambah transaksi</button>
    </form>
    <p class="muted" id="tx-form-msg" role="status"></p>
  </section>
  <section class="card">
    <h2>Daftar transaksi</h2>
    <div class="filters">
      <label>Cari <input type="search" id="tx-search" placeholder="Cari keterangan…"></label>
      <label>Kategori <select id="tx-filter-cat"><option value="">Semua kategori</option>${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Jenis <select id="tx-filter-type"><option value="">Semua</option><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
    </div>
    <div class="table-wrap"><table id="tx-table">
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th><th>Aksi</th></tr></thead>
      <tbody id="tx-body"></tbody>
    </table></div>
    <p class="muted" id="tx-empty" hidden>Tidak ada transaksi yang cocok. Coba kata kunci atau filter lain.</p>
    <p class="muted"><span id="tx-count"></span></p>
  </section>`;
  const renderList = () => {
    const q = (document.getElementById('tx-search').value || '').toLowerCase();
    const cat = document.getElementById('tx-filter-cat').value;
    const typ = document.getElementById('tx-filter-type').value;
    const rows = [...store.transactions].sort((a, b) => b.date.localeCompare(a.date)).filter((tr) =>
      (!q || tr.label.toLowerCase().includes(q)) && (!cat || tr.category === cat) && (!typ || tr.type === typ));
    document.getElementById('tx-body').innerHTML = rows.map((tr) => txRow(tr, tr.id === editingTxId)).join('');
    document.getElementById('tx-empty').hidden = rows.length > 0;
    document.getElementById('tx-count').textContent = rows.length + ' dari ' + store.transactions.length + ' transaksi ditampilkan.';
  };
  renderList();
  document.getElementById('tx-search').addEventListener('input', renderList);
  document.getElementById('tx-filter-cat').addEventListener('change', renderList);
  document.getElementById('tx-filter-type').addEventListener('change', renderList);
  document.getElementById('tx-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('tx-amount').value);
    if (!amount || amount <= 0) { document.getElementById('tx-form-msg').textContent = 'Jumlah harus lebih dari Rp0.'; return; }
    store.transactions.push({
      id: 't' + Date.now().toString(36),
      date: document.getElementById('tx-date').value,
      label: document.getElementById('tx-label').value.trim(),
      category: document.getElementById('tx-cat').value,
      type: document.getElementById('tx-type').value,
      amount,
    });
    save();
    document.getElementById('tx-form-msg').textContent = 'Transaksi ditambahkan. Total di atas sudah diperbarui.';
    document.getElementById('tx-form').reset();
    document.getElementById('tx-date').value = '2026-11-26';
    render(); // muat ulang tampilan agar KPI ikut berubah
  });
  document.getElementById('tx-body').addEventListener('click', (e) => {
    const del = e.target.closest('[data-del-tx]');
    const edit = e.target.closest('[data-edit-tx]');
    const saveBtn = e.target.closest('[data-save-tx]');
    const cancel = e.target.closest('[data-cancel-edit]');
    if (del) {
      store.transactions = store.transactions.filter((x) => x.id !== del.dataset.delTx);
      save(); render();
    } else if (edit) {
      editingTxId = edit.dataset.editTx; renderList();
    } else if (cancel) {
      editingTxId = null; renderList();
    } else if (saveBtn) {
      const tr = store.transactions.find((x) => x.id === saveBtn.dataset.saveTx);
      const row = saveBtn.closest('tr');
      const amount = Number(row.querySelector('.edit-amount').value);
      if (tr && amount > 0) {
        tr.date = row.querySelector('.edit-date').value;
        tr.label = row.querySelector('.edit-label').value.trim();
        tr.category = row.querySelector('.edit-cat').value;
        tr.type = row.querySelector('.edit-type').value;
        tr.amount = amount;
        save();
      }
      editingTxId = null; render();
    }
  });
}

// ---------------- Anggaran ----------------
function viewBudgets() {
  const spent = spentByCategory();
  const budgetTotal = store.budgets.reduce((s, b) => s + b.limit, 0);
  const spentTotal = Object.values(spent).reduce((s, v) => s + v, 0);
  root.innerHTML = `
  <section class="page-head"><h1>Anggaran bulanan</h1>
  <p>Batas belanja tiap kategori untuk ${MONTH_LABEL}. Ubah batasnya bila kebutuhan keluarga berubah — bilah kemajuan langsung menyesuaikan.</p></section>
  <div class="kpi-grid">
    ${kpiCard('Total anggaran', formatRp(budgetTotal), '8 kategori', '')}
    ${kpiCard('Sudah terpakai', formatRp(spentTotal), Math.round((spentTotal / budgetTotal) * 100) + '% dari anggaran', spentTotal > budgetTotal ? 'bad' : '')}
    ${kpiCard('Sisa anggaran', formatRp(Math.max(0, budgetTotal - spentTotal)), 'Untuk 4 hari tersisa di bulan ini', 'good')}
  </div>
  <section class="card"><h2>Batas per kategori</h2>
    <div id="budget-list">
    ${store.budgets.map((b) => {
    const c = categoryById(b.category);
    const s = spent[b.category] || 0;
    const p = b.limit ? Math.min(100, Math.round((s / b.limit) * 100)) : 0;
    const over = s > b.limit;
    return `<div class="budget-row" data-cat="${b.category}">
      <div class="budget-head"><span class="budget-name">${c.icon} ${esc(c.label)}</span>
      <span class="budget-nums">${formatRp(s)} dari ${formatRp(b.limit)} · ${p}%</span></div>
      <div class="bar-track"><div class="bar-fill ${over ? 'over' : ''}" style="width:${p}%"></div></div>
      <p class="budget-note">${over ? '⚠️ Lewat batas ' + formatRp(s - b.limit) + ' — kurangi belanja kategori ini sampai akhir bulan.' : 'Sisa ' + formatRp(b.limit - s) + ' untuk bulan ini.'}</p>
      <label class="budget-edit">Ubah batas (Rp) <input type="number" class="budget-limit-input" min="0" step="50000" value="${b.limit}"> <button class="btn btn-small" data-save-budget="${b.category}">Simpan batas</button></label>
    </div>`;
  }).join('')}
    </div>
    <p class="muted" id="budget-msg" role="status"></p>
  </section>
  <section class="card"><h2>Cara keluarga ini menyusun anggaran</h2>
    <ol class="tips-list">
      <li><strong>50-30-20 sebagai patokan:</strong> sekitar 50% pemasukan untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan dan dana darurat.</li>
      <li><strong>Amplop digital:</strong> tiap kategori punya batas sendiri; begitu batas habis, belanja kategori itu berhenti sampai bulan depan.</li>
      <li><strong>Evaluasi tiap Minggu:</strong> cek halaman ini setiap Minggu malam dan geser batas antar kategori bila ada yang mendesak.</li>
    </ol></section>`;
  document.getElementById('budget-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-save-budget]');
    if (!btn) return;
    const row = btn.closest('.budget-row');
    const v = Number(row.querySelector('.budget-limit-input').value);
    if (v >= 0) {
      store.budgets.find((b) => b.category === btn.dataset.saveBudget).limit = v;
      save();
      document.getElementById('budget-msg').textContent = 'Batas anggaran diperbarui.';
      render();
    }
  });
}

// ---------------- Tagihan ----------------
function viewBills() {
  const upcoming = store.bills.filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due));
  const paid = store.bills.filter((b) => b.paid).sort((a, b) => b.due.localeCompare(a.due));
  const unpaidTotal = upcoming.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  root.innerHTML = `
  <section class="page-head"><h1>Tagihan & pengingat</h1>
  <p>Tagihan rutin keluarga — yang belum lunas di atas, yang sudah lunas di bawah. Menandai lunas langsung memperbarui ringkasan.</p></section>
  <div class="kpi-grid">
    ${kpiCard('Belum lunas', formatRp(unpaidTotal), upcoming.length + ' tagihan', upcoming.length ? 'warn' : 'good')}
    ${kpiCard('Sudah lunas bulan ini', formatRp(paidTotal), paid.length + ' tagihan', 'good')}
    ${kpiCard('Tagihan terdekat', upcoming.length ? formatDateShort(upcoming[0].due) : '—', upcoming.length ? esc(upcoming[0].label) + ' · ' + formatRp(upcoming[0].amount) : 'Tidak ada tagihan menunggu', '')}
  </div>
  <section class="card"><h2>Menunggu pembayaran</h2>
    ${upcoming.length ? `<ul class="bill-list">${upcoming.map((b) => `
      <li><div><strong>${esc(b.label)}</strong><br><span class="muted">Jatuh tempo ${formatDateShort(b.due)} · ${esc(b.note)}</span></div>
      <div class="bill-right"><strong>${formatRp(b.amount)}</strong><br><button class="btn btn-small btn-primary" data-pay-bill="${b.id}">Tandai lunas</button></div></li>`).join('')}</ul>`
    : '<p>🎉 Semua tagihan sudah lunas.</p>'}
  </section>
  <section class="card"><h2>Sudah lunas</h2>
    <ul class="bill-list paid">${paid.map((b) => `<li><div><strong>${esc(b.label)}</strong><br><span class="muted">Jatuh tempo ${formatDateShort(b.due)} · ${esc(b.note)}</span></div><strong>${formatRp(b.amount)}</strong></li>`).join('')}</ul>
  </section>`;
  root.querySelectorAll('[data-pay-bill]').forEach((btn) => btn.addEventListener('click', () => {
    const bill = store.bills.find((b) => b.id === btn.dataset.payBill);
    if (bill) { bill.paid = true; save(); render(); }
  }));
}

// ---------------- Tabungan ----------------
function viewGoals() {
  const totalSaved = store.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = store.goals.reduce((s, g) => s + g.target, 0);
  root.innerHTML = `
  <section class="page-head"><h1>Tabungan & tujuan</h1>
  <p>Setiap tujuan punya target dan progres. Tambahkan setoran kapan saja — bilah dan persentasenya langsung bergerak.</p></section>
  <div class="kpi-grid">
    ${kpiCard('Total terkumpul', formatRp(totalSaved), Math.round((totalSaved / totalTarget) * 100) + '% dari semua target', 'good')}
    ${kpiCard('Total target', formatRp(totalTarget), store.goals.length + ' tujuan tabungan', '')}
    ${kpiCard('Masih kurang', formatRp(totalTarget - totalSaved), 'Terus menabung sedikit demi sedikit', '')}
  </div>
  <div class="grid-2">
  ${store.goals.map((g) => {
    const p = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<section class="card"><h2>${esc(g.label)}</h2>
      <p class="muted">${esc(g.note)}</p>
      <p class="goal-nums"><strong>${formatRp(g.saved)}</strong> dari ${formatRp(g.target)} · <strong>${p}%</strong></p>
      <div class="bar-track big"><div class="bar-fill" style="width:${p}%"></div></div>
      <p class="muted">Kurang ${formatRp(g.target - g.saved)} lagi.</p>
      <form class="goal-form" data-goal="${g.id}">
        <label>Tambah setoran (Rp)<input type="number" class="goal-amount" min="10000" step="10000" placeholder="100000" required></label>
        <button class="btn btn-primary" type="submit">+ Tambah ke tabungan</button>
      </form>
    </section>`;
  }).join('')}
  </div>`;
  root.querySelectorAll('.goal-form').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.querySelector('.goal-amount').value);
    const goal = store.goals.find((g) => g.id === form.dataset.goal);
    if (goal && amount > 0) {
      goal.saved += amount;
      save();
      render(); // bilah dan persentase langsung diperbarui
    }
  }));
}

// ---------------- Laporan ----------------
function viewReports() {
  const t = totals();
  const spent = spentByCategory();
  const trend = MONTHLY_TREND.map((m) => m.month === 'Nov 26'
    ? { month: m.month, income: t.income, spending: t.spending } : m);
  const catItems = CATEGORIES.map((c) => ({ label: c.label, value: spent[c.id] || 0, color: c.color }))
    .filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  root.innerHTML = `
  <section class="page-head"><h1>Laporan</h1>
  <p>Ringkasan enam bulan terakhir: tren pemasukan vs pengeluaran, rincian per kategori, dan pertumbuhan tabungan keluarga.</p></section>
  <div class="kpi-grid">
    ${kpiCard('Rata-rata pemasukan / bln', formatRp(trend.reduce((s, r) => s + r.income, 0) / trend.length), 'Jun–Nov 2026', 'good')}
    ${kpiCard('Rata-rata pengeluaran / bln', formatRp(trend.reduce((s, r) => s + r.spending, 0) / trend.length), 'Jun–Nov 2026', '')}
    ${kpiCard('Tabungan rata-rata / bln', formatRp(trend.reduce((s, r) => s + (r.income - r.spending), 0) / trend.length), 'Selisih pemasukan − pengeluaran', 'good')}
  </div>
  <section class="card"><h2>Tren pemasukan vs pengeluaran</h2>
    <p class="muted"><span class="legend-dot" style="background:#2e7d5b"></span> Pemasukan &nbsp; <span class="legend-dot" style="background:#dc2626"></span> Pengeluaran</p>
    <canvas id="chart-trend" height="240" aria-label="Grafik tren bulanan"></canvas></section>
  <div class="grid-2">
    <section class="card"><h2>Rincian pengeluaran per kategori</h2>
      <canvas id="chart-cat" height="240" aria-label="Grafik rincian kategori"></canvas>
      <ul class="legend-list">${catItems.map((i) => `<li><span class="legend-dot" style="background:${i.color}"></span>${esc(i.label)}<strong>${formatRp(i.value)}</strong></li>`).join('')}</ul>
    </section>
    <section class="card"><h2>Pertumbuhan tabungan</h2>
      <p class="muted">Total tabungan keluarga (dana darurat + pendidikan anak) per bulan.</p>
      <canvas id="chart-savings" height="200" aria-label="Grafik pertumbuhan tabungan"></canvas>
      <h2 class="mt">Rincian kategori</h2>
      <table class="simple-table"><thead><tr><th>Kategori</th><th>Anggaran</th><th>Terpakai</th><th>Sisa</th></tr></thead>
      <tbody>${store.budgets.map((b) => {
    const c = categoryById(b.category); const s = spent[b.category] || 0;
    return `<tr><td>${esc(c.label)}</td><td>${formatRp(b.limit)}</td><td>${formatRp(s)}</td><td class="${s > b.limit ? 'out' : 'in'}">${formatRp(b.limit - s)}</td></tr>`;
  }).join('')}</tbody></table>
    </section>
  </div>`;
  drawGroupedBars(document.getElementById('chart-trend'), trend);
  drawDonut(document.getElementById('chart-cat'), catItems, { centerLabel: formatRp(t.spending) });
  drawLine(document.getElementById('chart-savings'), [
    { label: 'Jun', value: 14200000 }, { label: 'Jul', value: 14800000 },
    { label: 'Agu', value: 15300000 }, { label: 'Sep', value: 16100000 },
    { label: 'Okt', value: 16800000 },
    { label: 'Nov', value: 18000000 + Math.max(0, t.savings) },
  ]);
}

// ---------------- Router ----------------
const ROUTES = {
  '': viewDashboard, dashboard: viewDashboard,
  transaksi: viewTransactions, anggaran: viewBudgets,
  tagihan: viewBills, tabungan: viewGoals, laporan: viewReports,
};

export function render() {
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  const route = hash.split('/')[0];
  const view = ROUTES[route] || viewDashboard;
  navActive(route === '' ? '' : route);
  view();
}

window.addEventListener('hashchange', () => { editingTxId = null; render(); });
render();
