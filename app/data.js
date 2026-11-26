// Data awal DompetKeluarga — anggaran rumah tangga Keluarga Hartono, Bandung.
// Semua angka dalam rupiah (Rp) untuk bulan November 2026. Data ini contoh realistis
// yang bisa diubah pengguna; disimpan ke localStorage saat pertama kali dibuka.
export const MONTH_LABEL = 'November 2026';
export const HOUSEHOLD = {
  name: 'Keluarga Hartono',
  city: 'Bandung, Jawa Barat',
  members: 'Budi (ayah) · Sari (ibu) · Dimas (12 th) · Kirana (8 th)',
  payday: 'Gajian tiap tanggal 25 dan 1',
};

export const CATEGORIES = [
  { id: 'dapur', label: 'Belanja dapur', color: '#2e7d5b', icon: '🛒' },
  { id: 'listrik', label: 'Listrik & air', color: '#b8860b', icon: '💡' },
  { id: 'transport', label: 'Transport & bensin', color: '#2563eb', icon: '🛵' },
  { id: 'sekolah', label: 'Sekolah anak', color: '#7c3aed', icon: '🎒' },
  { id: 'kesehatan', label: 'Kesehatan', color: '#dc2626', icon: '🩺' },
  { id: 'hiburan', label: 'Hiburan & makan luar', color: '#db2777', icon: '🍜' },
  { id: 'pakaian', label: 'Pakaian', color: '#0891b2', icon: '👕' },
  { id: 'lainnya', label: 'Lainnya', color: '#64748b', icon: '📦' },
];

export const INCOME_SOURCES = [
  { label: 'Gaji Budi — staf gudang', amount: 8500000 },
  { label: 'Gaji Sari — kasir toko', amount: 4200000 },
  { label: 'Freelance desain (Sari)', amount: 1150000 },
  { label: 'Bunga tabungan', amount: 85000 },
];

export const DEFAULT_BUDGETS = [
  { category: 'dapur', limit: 2800000 },
  { category: 'listrik', limit: 650000 },
  { category: 'transport', limit: 900000 },
  { category: 'sekolah', limit: 1500000 },
  { category: 'kesehatan', limit: 500000 },
  { category: 'hiburan', limit: 800000 },
  { category: 'pakaian', limit: 400000 },
  { category: 'lainnya', limit: 300000 },
];

export const DEFAULT_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', type: 'income', category: 'lainnya', label: 'Gaji Sari — kasir toko', amount: 4200000 },
  { id: 't02', date: '2026-11-01', type: 'expense', category: 'dapur', label: 'Belanja mingguan — Pasar Kosambi', amount: 412000 },
  { id: 't03', date: '2026-11-02', type: 'expense', category: 'transport', label: 'Bensin Pertalite motor', amount: 85000 },
  { id: 't04', date: '2026-11-03', type: 'expense', category: 'sekolah', label: 'SPP Dimas bulan November', amount: 750000 },
  { id: 't05', date: '2026-11-04', type: 'expense', category: 'hiburan', label: 'Makan malam keluarga — warung soto', amount: 128000 },
  { id: 't06', date: '2026-11-05', type: 'expense', category: 'dapur', label: 'Beras 10 kg + minyak goreng', amount: 186000 },
  { id: 't07', date: '2026-11-06', type: 'expense', category: 'kesehatan', label: 'Obat flu Kirana — apotek', amount: 64000 },
  { id: 't08', date: '2026-11-07', type: 'expense', category: 'dapur', label: 'Sayur & lauk — tukang sayur', amount: 97000 },
  { id: 't09', date: '2026-11-08', type: 'expense', category: 'transport', label: 'Ojek online — antar Dimas les', amount: 42000 },
  { id: 't10', date: '2026-11-09', type: 'expense', category: 'hiburan', label: 'Nonton bioskop berempat', amount: 210000 },
  { id: 't11', date: '2026-11-10', type: 'expense', category: 'listrik', label: 'Tagihan listrik PLN', amount: 412000 },
  { id: 't12', date: '2026-11-10', type: 'expense', category: 'listrik', label: 'Tagihan internet IndiHome', amount: 385000 },
  { id: 't13', date: '2026-11-11', type: 'expense', category: 'dapur', label: 'Belanja mingguan — supermarket', amount: 538000 },
  { id: 't14', date: '2026-11-12', type: 'expense', category: 'pakaian', label: 'Seragam sekolah Kirana', amount: 185000 },
  { id: 't15', date: '2026-11-13', type: 'expense', category: 'transport', label: 'Bensin Pertalite motor', amount: 90000 },
  { id: 't16', date: '2026-11-14', type: 'expense', category: 'dapur', label: 'Ayam, telur & tempe', amount: 143000 },
  { id: 't17', date: '2026-11-15', type: 'expense', category: 'listrik', label: 'Tagihan air PDAM', amount: 148000 },
  { id: 't18', date: '2026-11-16', type: 'expense', category: 'sekolah', label: 'Buku & alat tulis Dimas', amount: 132000 },
  { id: 't19', date: '2026-11-17', type: 'expense', category: 'kesehatan', label: 'Periksa gigi Budi — puskesmas', amount: 75000 },
  { id: 't20', date: '2026-11-18', type: 'expense', category: 'dapur', label: 'Belanja mingguan — Pasar Kosambi', amount: 467000 },
  { id: 't21', date: '2026-11-19', type: 'expense', category: 'hiburan', label: 'Langganan streaming keluarga', amount: 54000 },
  { id: 't22', date: '2026-11-20', type: 'expense', category: 'transport', label: 'Servis ringan motor', amount: 165000 },
  { id: 't23', date: '2026-11-21', type: 'expense', category: 'dapur', label: 'Buah & susu anak', amount: 89000 },
  { id: 't24', date: '2026-11-22', type: 'expense', category: 'sekolah', label: 'Les matematika Dimas', amount: 250000 },
  { id: 't25', date: '2026-11-23', type: 'expense', category: 'hiburan', label: 'Jajan akhir pekan — bakso & es teh', amount: 76000 },
  { id: 't26', date: '2026-11-24', type: 'expense', category: 'dapur', label: 'Gas LPG 3 kg (2 tabung)', amount: 40000 },
  { id: 't27', date: '2026-11-25', type: 'income', category: 'lainnya', label: 'Gaji Budi — staf gudang', amount: 8500000 },
  { id: 't28', date: '2026-11-25', type: 'income', category: 'lainnya', label: 'Freelance desain logo (Sari)', amount: 1150000 },
  { id: 't29', date: '2026-11-25', type: 'income', category: 'lainnya', label: 'Bunga tabungan', amount: 85000 },
  { id: 't30', date: '2026-11-26', type: 'expense', category: 'transport', label: 'Bensin Pertalite motor', amount: 80000 },
  { id: 't31', date: '2026-11-26', type: 'expense', category: 'dapur', label: 'Sayur & lauk harian', amount: 68000 },
];

export const DEFAULT_BILLS = [
  { id: 'b01', label: 'SPP sekolah Dimas', amount: 750000, due: '2026-12-05', paid: false, note: 'Transfer ke rekening sekolah' },
  { id: 'b02', label: 'Cicilan motor Vario', amount: 685000, due: '2026-11-28', paid: false, note: 'Auto-debit tanggal 28' },
  { id: 'b03', label: 'Iuran RT & kebersihan', amount: 50000, due: '2026-11-30', paid: false, note: 'Bayar ke Pak RT' },
  { id: 'b04', label: 'Langganan streaming', amount: 54000, due: '2026-11-27', paid: false, note: 'Kartu debit, perpanjang otomatis' },
  { id: 'b05', label: 'Listrik PLN', amount: 412000, due: '2026-11-20', paid: true, note: 'Lunas 10 Nov' },
  { id: 'b06', label: 'Internet IndiHome', amount: 385000, due: '2026-11-10', paid: true, note: 'Lunas 10 Nov' },
  { id: 'b07', label: 'Air PDAM', amount: 148000, due: '2026-11-15', paid: true, note: 'Lunas 15 Nov' },
  { id: 'b08', label: 'BPJS Kesehatan keluarga', amount: 210000, due: '2026-11-10', paid: true, note: 'Lunas 10 Nov' },
];

export const DEFAULT_GOALS = [
  { id: 'g01', label: 'Dana darurat', target: 20000000, saved: 12400000, note: 'Target 6× pengeluaran bulanan' },
  { id: 'g02', label: 'Liburan keluarga ke Yogyakarta', target: 6000000, saved: 3750000, note: 'Berangkat libur sekolah Juni 2027' },
  { id: 'g03', label: 'DP motor baru', target: 8000000, saved: 2100000, note: 'Ganti motor lama tahun depan' },
  { id: 'g04', label: 'Tabungan pendidikan anak', target: 15000000, saved: 5600000, note: 'Untuk masuk SMP Dimas' },
];

// Tren 6 bulan terakhir (pemasukan vs pengeluaran, rupiah) — untuk halaman Laporan.
export const MONTHLY_TREND = [
  { month: 'Jun 26', income: 13200000, spending: 7450000 },
  { month: 'Jul 26', income: 13450000, spending: 8120000 },
  { month: 'Agu 26', income: 13100000, spending: 7980000 },
  { month: 'Sep 26', income: 13935000, spending: 7640000 },
  { month: 'Okt 26', income: 13600000, spending: 8310000 },
  { month: 'Nov 26', income: 13935000, spending: 0 }, // diisi dari transaksi nyata
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function formatRp(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function formatDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return d + ' ' + names[m - 1] + ' ' + y;
}
