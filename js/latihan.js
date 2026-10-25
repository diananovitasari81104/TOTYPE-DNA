/* =========================================================
   TOTYPE – halaman Latihan
   Buka dengan latihan.html?level=1 (angka = nomor level)
   ========================================================= */
const BATAS_DIAM_DETIK = 30;   // diam selama ini → latihan dijeda
const BATAS_SALAH = 3;         // salah berulang di huruf yang sama → bantuan muncul

/* ---------- Jari untuk tiap tuts (teknik 10 jari) ---------- */
const JARI = {};
(function () {
  const peta = {
    'kiri-kelingking': ['`', '1', 'q', 'a', 'z', 'Tab', 'Caps', 'ShiftL', 'CtrlL'],
    'kiri-manis': ['2', 'w', 's', 'x'],
    'kiri-tengah': ['3', 'e', 'd', 'c'],
    'kiri-telunjuk': ['4', '5', 'r', 't', 'f', 'g', 'v', 'b'],
    'kanan-telunjuk': ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'],
    'kanan-tengah': ['8', 'i', 'k', ','],
    'kanan-manis': ['9', 'o', 'l', '.'],
    'kanan-kelingking': ['0', '-', '=', 'p', '[', ']', '\\', ';', "'", '/', 'Enter', 'ShiftR', 'Backspace', 'CtrlR'],
    'jempol': [' ']
  };
  Object.keys(peta).forEach(function (j) { peta[j].forEach(function (t) { JARI[t] = j; }); });
})();
const NAMA_JARI = {
  kelingking: 'Jari Kelingking', manis: 'Jari Manis', tengah: 'Jari Tengah', telunjuk: 'Jari Telunjuk'
};
function namaJari(id) {
  if (id === 'jempol') return 'Ibu Jari';
  const p = id.split('-');
  return NAMA_JARI[p[1]] + ' ' + (p[0] === 'kiri' ? 'Kiri' : 'Kanan');
}

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

function dialogKeluar() {
  if (!S || S.selesai) return;
  S.jeda = true;
  bukaDialog('keluar',
    '<div class="dialog-ikon"><svg class="ik" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg></div>' +
    '<h2>Yakin mau keluar?</h2>' +
    '<p>Latihan ini belum selesai dan tidak akan dihitung. Level yang sudah lulus tetap tersimpan.</p>' +
    '<div class="aksi"><button class="tombol tombol-utama" id="d-lanjut">Lanjut Latihan</button>' +
    '<button class="tombol tombol-kedua" id="d-keluar">Keluar</button></div>');
  $('d-lanjut').addEventListener('click', function () { tutupDialog(); lanjutkan(); });
  $('d-keluar').addEventListener('click', function () { clearInterval(detak); window.location.href = 'beranda.html'; });
}

function dialogDiam() {
  S.jeda = true;
  perbaruiStatistik();
  bukaDialog('diam',
    '<div class="dialog-ikon"><svg class="ik" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></div>' +
    '<h2>Latihan dijeda</h2>' +
    '<p>Kamu tidak mengetik selama ' + BATAS_DIAM_DETIK + ' detik. Tekan tombol apa saja untuk lanjut.</p>' +
    '<div class="aksi"><button class="tombol tombol-utama" id="d-lanjut">Lanjut</button></div>');
  $('d-lanjut').addEventListener('click', function () { tutupDialog(); lanjutkan(); });
}
