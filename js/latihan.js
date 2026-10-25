/* =========================================================
   TOTYPE – halaman Latihan
   Buka dengan latihan.html?level=1 (angka = nomor level)
   ========================================================= */
const BATAS_DIAM_DETIK = 30;   // diam selama ini → latihan dijeda
const BATAS_SALAH = 3;         // salah berulang di huruf yang sama → bantuan muncul

/* Peta jari (JARI, namaJari) ada di js/jari.js */

/* ---------- Susunan keyboard: [id, lebar, label] ---------- */
const BARIS_KB = [
  [['`'], ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'], ['0'], ['-'], ['='], ['Backspace', 2, 'Hapus']],
  [['Tab', 1.5, 'Tab'], ['q'], ['w'], ['e'], ['r'], ['t'], ['y'], ['u'], ['i'], ['o'], ['p'], ['['], [']'], ['\\', 1.5]],
  [['Caps', 1.75, 'Caps'], ['a'], ['s'], ['d'], ['f'], ['g'], ['h'], ['j'], ['k'], ['l'], [';'], ["'"], ['Enter', 2.25, 'Enter']],
  [['ShiftL', 2.25, 'Shift'], ['z'], ['x'], ['c'], ['v'], ['b'], ['n'], ['m'], [','], ['.'], ['/'], ['ShiftR', 2.75, 'Shift']],
  [['CtrlL', 1.5, 'Ctrl'], ['AltL', 1.5, 'Alt'], [' ', 9, 'Spasi'], ['AltR', 1.5, 'Alt'], ['CtrlR', 1.5, 'Ctrl']]
];

/* ---------- Persiapan ---------- */
const siswa = Sesi.wajibMasuk();
const progres = siswa ? Sesi.muatProgres(siswa) : null;
const nomorLevel = parseInt(new URLSearchParams(location.search).get('level'), 10) || 1;
const level = LEVELS.find(function (l) { return l.id === nomorLevel; });

// Level belum terbuka atau tidak ada → kembali ke Beranda
if (siswa && (!level || level.id > progres.levelTerbuka)) {
  window.location.href = 'beranda.html';
}

function $(id) { return document.getElementById(id); }
function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function formatWaktu(d) {
  d = Math.max(0, Math.round(d));
  return String(Math.floor(d / 60)).padStart(2, '0') + ':' + String(d % 60).padStart(2, '0');
}

let S = null;      // status sesi latihan
let detak = null;  // interval jam
let dialog = null; // dialog yang sedang terbuka: 'keluar' | 'diam'

if (siswa && level && level.id <= progres.levelTerbuka) mulai();

function mulai() {
  // Kepala
  $('nama-siswa').textContent = siswa.nama;
  $('kelas-siswa').textContent = siswa.kelas.split(' (')[0] + ' · Absen ' + siswa.absen;
  $('avatar').textContent = siswa.nama.charAt(0).toUpperCase();
  document.title = 'Level ' + level.id + ' – TOTYPE';

  const latihan = level.latihan[Math.floor(Math.random() * level.latihan.length)];
  S = {
    teks: latihan.teks, kode: latihan.kode,
    pos: 0, total: 0, benar: 0,
    salahDiSini: false, salahBeruntun: 0,
    pernahSalah: new Set(), salahPerHuruf: {},
    mulai: null, aktifMs: 0, detakTerakhir: 0, ketikTerakhir: 0,
    jeda: false, selesai: false,
    batas: level.timer ? Math.ceil(latihan.teks.length / 5 / level.syarat.wpm * 60) : null,
    satuan: level.id <= 2 ? 'huruf' : 'kata'
  };

  // Bilah sesi
  $('jejak-level').textContent = 'Level ' + level.id;
  $('jejak-nama').textContent = level.nama;
  if (level.timer) { $('pil-waktu').classList.add('mundur'); $('teks-waktu').textContent = formatWaktu(S.batas); }
  $('btn-keluar-sesi').addEventListener('click', dialogKeluar);

  // Teks: dipecah per kata, spasi ikut di akhir kata agar baris tidak diawali spasi
  $('label-teks').textContent = level.kategori + ' · ' + latihan.kode;
  let html = '', i = 0;
  S.teks.split(' ').forEach(function (kata, k, semua) {
    html += '<span class="kata">';
    for (let j = 0; j < kata.length; j++) { html += '<span class="huruf">' + esc(kata[j]) + '</span>'; i++; }
    if (k < semua.length - 1) { html += '<span class="huruf spasi"> </span>'; i++; }
    html += '</span> ';
  });
  $('teks-latihan').innerHTML = html;
  if (level.timer) $('teks-latihan').classList.add('panjang');
  S.elHuruf = Array.prototype.slice.call(document.querySelectorAll('#teks-latihan .huruf'));

  // Keyboard
  $('keyboard').innerHTML = BARIS_KB.map(function (baris) {
    return '<div class="baris-kb">' + baris.map(function (t) {
      const id = t[0], w = t[1] || 1, label = t[2] || id;
      const kelas = 'tuts' + (label.length > 1 ? ' mod' : '') + (id === 'f' || id === 'j' ? ' benjol' : '');
      return '<div class="' + kelas + '" data-k="' + esc(id) + '" style="width:calc(var(--u) * ' + w + ' + var(--g) * ' + (w - 1) + ')">' + esc(label) + '</div>';
    }).join('') + '</div>';
  }).join('');
  if (level.timer) $('keyboard').classList.add('kecil');

  perbarui();
}

/* ---------- Gambar tangan (SVG sederhana) ---------- */
function gambarTangan(sisi, jariAktif) {
  // Posisi jari tangan kiri: kelingking → ibu jari; tangan kanan dicerminkan
  const jari = [
    ['kelingking', 18, 36, 14, 42],
    ['manis', 35, 20, 15, 56],
    ['tengah', 53, 12, 15, 62],
    ['telunjuk', 71, 22, 15, 52]
  ];
  let s = '<svg viewBox="0 0 120 120" aria-hidden="true"><g' + (sisi === 'kanan' ? ' transform="translate(120 0) scale(-1 1)"' : '') + '>';
  s += '<rect x="16" y="62" width="74" height="52" rx="22" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>';
  jari.forEach(function (j) {
    const aktif = jariAktif === sisi + '-' + j[0];
    s += '<rect x="' + j[1] + '" y="' + j[2] + '" width="' + j[3] + '" height="' + j[4] + '" rx="7.5" fill="' + (aktif ? '#F59E0B' : '#F1F5F9') + '" stroke="' + (aktif ? '#D97706' : '#CBD5E1') + '" stroke-width="1.5"/>';
  });
  const jempolAktif = jariAktif === 'jempol';
  s += '<rect x="88" y="70" width="14" height="36" rx="7" transform="rotate(-38 95 88)" fill="' + (jempolAktif ? '#F59E0B' : '#F1F5F9') + '" stroke="' + (jempolAktif ? '#D97706' : '#CBD5E1') + '" stroke-width="1.5"/>';
  return s + '</g></svg>';
}

/* ---------- Tampilan diperbarui setiap tuts ditekan ---------- */
function idTuts(ch) { return ch === ' ' ? ' ' : ch.toLowerCase(); }
function perluShift(ch) { return ch !== ch.toLowerCase(); }
function shiftUntuk(ch) { return (JARI[idTuts(ch)] || '').indexOf('kiri') === 0 ? 'ShiftR' : 'ShiftL'; }
function namaTuts(ch) {
  if (ch === ' ') return 'Spasi';
  if (ch === '.') return 'Titik';
  if (ch === ',') return 'Koma';
  return ch.toUpperCase();
}

function perbarui() {
  const ch = S.teks[S.pos];
  const bantu = S.salahBeruntun >= BATAS_SALAH;
  const tampilSorotan = ch !== undefined && (level.sorotan || bantu);

  // Warna huruf
  S.elHuruf.forEach(function (el, i) {
    let c = 'huruf' + (S.teks[i] === ' ' ? ' spasi' : '');
    if (i < S.pos) c += ' benar' + (S.pernahSalah.has(i) ? ' pernah-salah' : '');
    else if (i === S.pos) c += ' sekarang' + (S.salahDiSini ? ' salah' : '');
    el.className = c;
  });

  // Sorotan tuts
  document.querySelectorAll('.tuts.target, .tuts.bantu').forEach(function (el) { el.classList.remove('target', 'bantu'); });
  const jari = ch !== undefined ? JARI[idTuts(ch)] : null;
  if (tampilSorotan) {
    const t = document.querySelector('.tuts[data-k="' + (ch === '"' ? '\\"' : ch === '\\' ? '\\\\' : idTuts(ch)) + '"]');
    if (t) { t.classList.add('target'); if (bantu) t.classList.add('bantu'); }
    if (perluShift(ch)) document.querySelector('.tuts[data-k="' + shiftUntuk(ch) + '"]').classList.add('target');
  }

  // Pil petunjuk
  const pil = $('pil-petunjuk');
  if (ch === undefined) pil.innerHTML = '';
  else if (tampilSorotan) {
    pil.innerHTML = '<i></i>Tuts berikutnya: <b>' + (perluShift(ch) ? 'Shift + ' : '') + esc(namaTuts(ch)) + '</b>' +
      '<span class="pemisah"></span>Pakai: <b>' + namaJari(jari) + '</b>';
  } else {
    pil.innerHTML = 'Sorotan keyboard mati di level ini. Ingat posisi jarimu.';
  }

  // Gambar tangan
  const jariTangan = tampilSorotan ? jari : null;
  $('tangan-kiri').innerHTML = gambarTangan('kiri', jariTangan);
  $('tangan-kanan').innerHTML = gambarTangan('kanan', jariTangan);
  ['kiri', 'kanan'].forEach(function (sisi) {
    const ket = $('ket-' + sisi);
    const aktif = jariTangan && (jariTangan.indexOf(sisi) === 0 || jariTangan === 'jempol');
    ket.textContent = aktif ? namaJari(jariTangan) : 'Posisi siaga (home row)';
    ket.classList.toggle('aktif', !!aktif);
  });

  // Pesan status
  const pesan = $('pesan-status');
  pesan.classList.toggle('bantuan', bantu);
  let teksPesan;
  if (bantu) teksPesan = 'Pelan-pelan. Tekan ' + (perluShift(ch) ? 'Shift + ' : '') + namaTuts(ch) + ' dengan ' + namaJari(jari).toLowerCase() + '.';
  else if (!S.mulai) teksPesan = 'Mulai mengetik kapan saja. Waktu berjalan setelah tombol pertama.';
  else teksPesan = 'Santai, utamakan ketepatan tuts dan posisi jari.';
  pesan.querySelector('span').textContent = teksPesan;

  // Kemajuan sesi
  let sudah, semua;
  if (S.satuan === 'kata') {
    semua = S.teks.split(' ').length;
    sudah = S.pos >= S.teks.length ? semua : S.teks.slice(0, S.pos).split(' ').length - 1;
  } else { semua = S.teks.length; sudah = S.pos; }
  $('teks-kemajuan').textContent = sudah + ' / ' + semua + ' ' + (S.satuan === 'kata' ? 'Kata' : 'Huruf');
  $('bar-kemajuan').style.width = (S.pos / S.teks.length * 100) + '%';

  perbaruiStatistik();
}

function akurasi() { return S.total ? Math.round(S.benar / S.total * 100) : 0; }
function wpm() { const m = S.aktifMs / 60000; return m > 0.02 ? Math.round((S.pos / 5) / m) : 0; }

function perbaruiStatistik() {
  $('st-akurasi').textContent = S.total ? akurasi() + '%' : '–';
  $('st-wpm').textContent = wpm() + ' kata/menit';
  if (level.timer) {
    const sisa = S.batas - S.aktifMs / 1000;
    $('teks-waktu').textContent = formatWaktu(Math.ceil(sisa));
    $('pil-waktu').classList.toggle('mepet', sisa <= 15);
  } else {
    $('teks-waktu').textContent = formatWaktu(S.aktifMs / 1000);
  }
}

/* ---------- Jam latihan ---------- */
function berjalan() { return S && S.mulai && !S.jeda && !S.selesai; }

function tik() {
  const now = Date.now();
  if (berjalan()) {
    S.aktifMs += now - S.detakTerakhir;
    if (now - S.ketikTerakhir > BATAS_DIAM_DETIK * 1000) { S.detakTerakhir = now; dialogDiam(); return; }
    if (level.timer && S.aktifMs / 1000 >= S.batas) { S.aktifMs = S.batas * 1000; selesai(true); return; }
  }
  S.detakTerakhir = now;
  perbaruiStatistik();
}

function lanjutkan() {
  S.jeda = false;
  S.detakTerakhir = Date.now();
  S.ketikTerakhir = Date.now();
}

/* ---------- Saat tuts ditekan ---------- */
function kilat(id, salah) {
  const el = document.querySelector('.tuts[data-k="' + (id === '\\' ? '\\\\' : id === '"' ? '\\"' : id) + '"]');
  if (!el) return;
  const c = salah ? 'ditekan-salah' : 'ditekan';
  el.classList.add(c);
  setTimeout(function () { el.classList.remove(c); }, 140);
}

document.addEventListener('keydown', function (e) {
  if (!S || S.selesai) return;
  if (dialog === 'diam') { e.preventDefault(); tutupDialog(); lanjutkan(); return; }
  if (dialog === 'keluar' && e.key === 'Escape') { tutupDialog(); lanjutkan(); return; }
  if (dialog) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') { dialogKeluar(); return; }
  if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') e.preventDefault();
  if (e.key.length !== 1) return;
  e.preventDefault();

  const now = Date.now();
  if (!S.mulai) { S.mulai = now; S.detakTerakhir = now; detak = setInterval(tik, 250); }
  S.ketikTerakhir = now;
  S.total++;

  const harus = S.teks[S.pos];
  if (e.key === harus) {
    S.benar++; S.pos++;
    S.salahDiSini = false; S.salahBeruntun = 0;
    kilat(idTuts(e.key), false);
    if (S.pos >= S.teks.length) { perbarui(); selesai(false); return; }
  } else {
    // Huruf salah: tetap di posisi yang sama sampai diketik benar
    S.salahDiSini = true;
    S.salahBeruntun++;
    S.pernahSalah.add(S.pos);
    const k = harus === ' ' ? 'Spasi' : harus.toUpperCase();
    S.salahPerHuruf[k] = (S.salahPerHuruf[k] || 0) + 1;
    kilat(idTuts(e.key), true);
  }
  perbarui();
});

/* ---------- Selesai: simpan hasil lalu ke halaman Hasil ---------- */
function selesai(waktuHabis) {
  if (S.selesai) return;
  S.selesai = true;
  clearInterval(detak);
  tutupDialog();

  const ak = akurasi(), kec = wpm();
  const lulus = S.total > 0 && ak >= level.syarat.akurasi && kec >= level.syarat.wpm;

  const kunci = String(level.id);
  progres.riwayat[kunci] = (progres.riwayat[kunci] || []).concat([
    { akurasi: ak, wpm: kec, lulus: lulus, kode: S.kode, waktu: new Date().toISOString() }
  ]).slice(-20);

  let levelBaru = false;
  if (lulus) {
    if (progres.levelLulus.indexOf(level.id) === -1) progres.levelLulus.push(level.id);
    if (level.id < LEVELS.length && progres.levelTerbuka <= level.id) { progres.levelTerbuka = level.id + 1; levelBaru = true; }
  }
  Sesi.simpanProgres(siswa, progres);

  const hurufSalah = Object.keys(S.salahPerHuruf)
    .map(function (k) { return { huruf: k, jumlah: S.salahPerHuruf[k] }; })
    .sort(function (a, b) { return b.jumlah - a.jumlah; })
    .slice(0, 3);

  try {
    localStorage.setItem('totype:hasil', JSON.stringify({
      level: level.id, akurasi: ak, wpm: kec, lulus: lulus, levelBaru: levelBaru,
      totalTuts: S.total, tutsSalah: S.total - S.benar,
      waktuHabis: waktuHabis, hurufSalah: hurufSalah, kode: S.kode, detik: Math.round(S.aktifMs / 1000)
    }));
  } catch (err) { /* abaikan */ }

  window.location.href = 'hasil.html';
}

/* ---------- Dialog ---------- */
function bukaDialog(jenis, html) {
  dialog = jenis;
  $('tempat-dialog').innerHTML = '<div class="tirai"><div class="dialog" role="dialog" aria-modal="true">' + html + '</div></div>';
  const t = document.querySelector('#tempat-dialog .tombol-utama');
  if (t) t.focus();
}
function tutupDialog() { dialog = null; $('tempat-dialog').innerHTML = ''; }

/* Dialog 1: Konfirmasi keluar (tombol Keluar Sesi atau Esc) */
function dialogKeluar() {
  if (!S || S.selesai) return;
  S.jeda = true;
  bukaDialog('keluar',
    '<div class="dialog-ikon oranye"><svg class="ik" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16h.01"/></svg></div>' +
    '<h2>Yakin mau keluar?</h2>' +
    '<p>Latihan ini belum selesai dan tidak akan dihitung. Level yang sudah lulus tetap tersimpan.</p>' +
    '<div class="aksi">' +
      '<button class="tombol tombol-kedua" id="d-keluar"><svg class="ik" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>Keluar</button>' +
      '<button class="tombol tombol-utama" id="d-lanjut">Lanjut Latihan<svg class="ik" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
    '</div>' +
    '<p class="dialog-catatan">Tekan <kbd>Esc</kbd> untuk kembali mengetik</p>');
  $('d-lanjut').addEventListener('click', function () { tutupDialog(); lanjutkan(); });
  $('d-keluar').addEventListener('click', function () { clearInterval(detak); window.location.href = 'beranda.html'; });
}

/* Dialog 2: Jeda otomatis (tidak mengetik selama BATAS_DIAM_DETIK) */
function dialogDiam() {
  S.jeda = true;
  perbaruiStatistik();
  const labelWaktu = level.timer ? 'Sisa waktu' : 'Waktu berjalan';
  const waktu = level.timer ? formatWaktu(Math.ceil(S.batas - S.aktifMs / 1000)) : formatWaktu(S.aktifMs / 1000);
  bukaDialog('diam',
    '<div class="dialog-ikon"><svg class="ik" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg></div>' +
    '<span class="pil-jeda">Jeda otomatis</span>' +
    '<h2>Latihan Dijeda</h2>' +
    '<p>Latihan dijeda karena kamu tidak mengetik selama ' + BATAS_DIAM_DETIK + ' detik. Tekan tombol apa saja untuk lanjut.</p>' +
    '<div class="kotak-waktu">' +
      '<span><svg class="ik" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>' + labelWaktu + '</span>' +
      '<b>' + waktu + '</b><small>berhenti</small>' +
    '</div>' +
    '<button class="tombol tombol-utama tombol-penuh" id="d-lanjut"><svg class="ik" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Lanjut Mengetik</button>' +
    '<p class="dialog-catatan">Atau tekan <kbd>Spasi</kbd> <kbd>Enter</kbd> atau tombol apa saja</p>' +
    '<div class="dialog-saran"><svg class="ik" viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>Ambil napas sejenak, regangkan jari tanganmu.</div>');
  $('d-lanjut').addEventListener('click', function () { tutupDialog(); lanjutkan(); });
}