/* =========================================================
   TOTYPE – halaman Hasil Latihan
   Membaca hasil latihan terakhir (disimpan oleh latihan.js),
   lalu menampilkan versi LULUS atau BELUM LULUS.
   ========================================================= */
const siswa = Sesi.wajibMasuk();
let hasil = null;
try { hasil = JSON.parse(localStorage.getItem('totype:hasil')); } catch (e) { /* abaikan */ }

// Belum ada hasil latihan → kembali ke Beranda
if (siswa && !hasil) window.location.href = 'beranda.html';
if (siswa && hasil) tampilkanHasil();

function tampilkanHasil() {
  /* ---------- Kepala ---------- */
  document.getElementById('nama-siswa').textContent = siswa.nama;
  document.getElementById('kelas-siswa').textContent = siswa.kelas.split(' (')[0] + ' · Absen ' + siswa.absen;
  document.getElementById('avatar').textContent = siswa.nama.charAt(0).toUpperCase();
  document.getElementById('btn-keluar').addEventListener('click', Sesi.keluar);

  const level = LEVELS.find(function (l) { return l.id === hasil.level; });
  const berikut = LEVELS.find(function (l) { return l.id === hasil.level + 1; });
  const sebelum = LEVELS.find(function (l) { return l.id === hasil.level - 1; });
  const syarat = level.syarat;
  const akurasiOk = hasil.akurasi >= syarat.akurasi;
  const kecepatanOk = hasil.wpm >= syarat.wpm;

  /* ---------- Ikon ---------- */
  const IKON = {
    centang: '<path d="M5 12l5 5 9-10"/>',
    lampu: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    jam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    bendera: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    kilat: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    cari: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    kunci: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    kanan: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    kiri: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    ulang: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    daftar: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    piala: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'
  };
  function ik(n) { return '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">' + IKON[n] + '</svg>'; }
  function durasi(d) { d = d || 0; return String(Math.floor(d / 60)).padStart(2, '0') + ':' + String(d % 60).padStart(2, '0'); }

  /* ---------- Bilah atas ---------- */
  const bilah =
    '<section class="bilah-hasil">' +
      '<span class="pil-selesai"><i></i>Selesai latihan · Level ' + level.id + ': ' + level.nama + '</span>' +
      '<span class="durasi">' + ik('jam') + 'Durasi Sesi: <b>' + durasi(hasil.detik) + '</b></span>' +
    '</section>';

  /* ---------- Kartu utama (status) ---------- */
  let status;
  if (hasil.lulus) {
    let judul, sub;
    if (!berikut) {
      judul = 'Lulus! Semua level sudah selesai';
      sub = 'Luar biasa, kamu sudah menguasai dasar mengetik 10 jari dari baris tengah sampai paragraf.';
    } else {
      judul = 'Lulus! Level ' + berikut.id + ' – ' + berikut.nama + (hasil.levelBaru ? ' sekarang terbuka' : ' siap dilanjutkan');
      sub = 'Hebat, kamu menyelesaikan latihan ' + level.nama.toLowerCase() + ' dengan akurasi di atas standar kelulusan (≥' + syarat.akurasi + '%).';
    }
    status =
      '<section class="kartu-status lulus">' +
        '<div class="ikon-besar">' + ik(berikut ? 'centang' : 'piala') + '</div>' +
        '<div><span class="label-status">Status: Lulus kompetensi</span>' +
        '<h1>' + judul + '</h1><p>' + sub + '</p></div>' +
      '</section>';
  } else {
    // Sebutkan syarat yang belum tercapai
    let kalimat, kurang, targetLabel, targetNilai;
    if (!akurasiOk) {
      kalimat = 'Akurasi kamu <em>' + hasil.akurasi + '%</em>, syaratnya ' + syarat.akurasi + '%.';
      targetLabel = 'Target'; targetNilai = syarat.akurasi + '%'; kurang = 'Kurang ' + (syarat.akurasi - hasil.akurasi) + '% lagi';
    } else {
      kalimat = 'Kecepatan kamu <em>' + hasil.wpm + ' KPM</em>, syaratnya ' + syarat.wpm + ' KPM.';
      targetLabel = 'Target'; targetNilai = syarat.wpm + ' KPM'; kurang = 'Kurang ' + (syarat.wpm - hasil.wpm) + ' KPM lagi';
    }
    status =
      '<section class="kartu-status belum">' +
        '<div class="ikon-besar">' + ik('lampu') + '</div>' +
        '<div class="status-teks">' +
          '<h1>' + (hasil.waktuHabis ? 'Waktu habis. ' : 'Belum lulus. ') + kalimat + ' Kamu sudah makin dekat!</h1>' +
          '<p>Jangan berkecil hati, salah menekan tuts adalah bagian normal dari melatih memori otot jari tangan.</p>' +
        '</div>' +
        '<div class="kotak-target"><span>' + targetLabel + '</span><b>' + targetNilai + '</b><small>' + kurang + '</small></div>' +
      '</section>';
  }

  /* ---------- Kartu kecepatan ---------- */
  let kakiKecepatan, pilKecepatan = '';
  if (!syarat.wpm) {
    kakiKecepatan = ik('kilat') + '<span>Kecepatan belum dinilai di level ini. Fokus pada ketepatan dulu.</span>';
  } else if (kecepatanOk) {
    pilKecepatan = '<span class="pil-kecil biru">Lulus target min. (' + syarat.wpm + ')</span>';
    kakiKecepatan = ik('bendera') + '<span>Target minimal: <b>' + syarat.wpm + ' KPM</b> tercapai</span>';
  } else {
    pilKecepatan = '<span class="pil-kecil oranye">Perlu ditingkatkan</span>';
    kakiKecepatan = ik('bendera') + '<span>Target minimal: <b>' + syarat.wpm + ' KPM</b>, kurang ' + (syarat.wpm - hasil.wpm) + ' lagi</span>';
  }
  const kartuKecepatan =
    '<div class="kartu-nilai' + (syarat.wpm && !kecepatanOk ? ' perlu' : '') + '">' +
      '<div class="kartu-nilai-kepala"><span class="label-kartu">' + ik('kilat') + 'Kecepatan mengetik</span>' + pilKecepatan + '</div>' +
      '<div class="angka-besar">' + hasil.wpm + '<span><b>KPM</b><small>kata per menit</small></span></div>' +
      '<div class="kaki-kartu">' + kakiKecepatan + '</div>' +
    '</div>';

  /* ---------- Kartu akurasi ---------- */
  const salah = hasil.tutsSalah !== undefined ? hasil.tutsSalah : null;
  const total = hasil.totalTuts !== undefined ? hasil.totalTuts : null;
  const keteranganSalah = salah !== null ? salah + ' salah dari ' + total + ' tuts' : '';
  let isiAkurasi;
  if (akurasiOk) {
    isiAkurasi =
      '<div class="angka-besar">' + hasil.akurasi + '%<span><b class="hijau">Akurat</b><small>' + keteranganSalah + '</small></span></div>' +
      '<div class="kaki-kartu">' + ik('centang') + '<span>Target kelulusan <b>≥' + syarat.akurasi + '%</b> (terpenuhi)</span></div>';
  } else {
    isiAkurasi =
      '<div class="angka-besar">' + hasil.akurasi + '%<span><b>Target: ' + syarat.akurasi + '%</b><small class="oranye">Selisih: kurang ' + (syarat.akurasi - hasil.akurasi) + '%</small></span></div>' +
      '<div class="bar-capaian"><i style="width:' + hasil.akurasi + '%"></i><span class="garis-syarat" style="left:' + syarat.akurasi + '%"></span></div>' +
      '<div class="label-capaian"><span>0%</span><b>Capaian: ' + hasil.akurasi + '%</b><span>Syarat: ' + syarat.akurasi + '%</span></div>';
  }
  const kartuAkurasi =
    '<div class="kartu-nilai' + (akurasiOk ? '' : ' perlu') + '">' +
      '<div class="kartu-nilai-kepala"><span class="label-kartu">' + ik('target') + 'Akurasi ketikan</span>' +
        (akurasiOk ? '<span class="pil-kecil hijau">Terpenuhi</span>' : '<span class="pil-kecil oranye">Perlu ditingkatkan</span>') + '</div>' +
      isiAkurasi +
    '</div>';

  /* ---------- Huruf yang sering salah ---------- */
  let isiHuruf;
  if (hasil.hurufSalah && hasil.hurufSalah.length) {
    isiHuruf = '<div class="daftar-tuts">' + hasil.hurufSalah.map(function (h) {
      const lebar = h.huruf === 'Spasi' ? ' lebar' : '';
      return '<div class="item-tuts">' +
        '<div class="keycap' + lebar + '">' + h.huruf + '<small>tuts</small></div>' +
        '<div><span class="jumlah-salah">' + h.jumlah + ' kali salah</span>' +
        '<b>' + namaJari(jariUntuk(h.huruf)) + '</b>' +
        '<small>' + barisUntuk(h.huruf) + '</small></div>' +
      '</div>';
    }).join('') + '</div>';
  } else {
    isiHuruf = '<p class="kosong">' + ik('centang') + 'Tidak ada tuts yang salah. Pertahankan posisi jarimu!</p>';
  }
  const tips = hasil.lulus
    ? 'Otot jari tanganmu mulai terbiasa dengan posisi tuts. Istirahatkan pergelangan tangan sejenak sebelum lanjut.'
    : 'Pelankan sedikit ketukanmu. Utamakan ketepatan posisi jari daripada mengejar kecepatan, seperti mengencangkan baut silinder blok: presisi selalu nomor satu!';
  const kartuHuruf =
    '<section class="kartu-huruf">' +
      '<div class="kartu-huruf-kepala"><div>' +
        '<h2>' + ik('cari') + 'Huruf yang Sering Salah</h2>' +
        '<p>' + (hasil.lulus ? 'Perhatikan penempatan jari untuk huruf-huruf berikut agar semakin lancar:' : 'Fokuskan latihan berikutnya pada tuts ini:') + '</p>' +
      '</div><span class="pil-kecil abu">' + ik('keyboard') + 'Analisis tuts & jari</span></div>' +
      isiHuruf +
      '<div class="tips-hasil">' + ik('kunci') + '<p><b>Tips Mekanik:</b> ' + tips + '</p></div>' +
    '</section>';

  /* ---------- Tombol aksi ---------- */
  let aksi;
  if (hasil.lulus) {
    aksi = '<div class="aksi-hasil">' +
      (berikut
        ? '<a class="tombol tombol-utama" href="latihan.html?level=' + berikut.id + '">Lanjut ke Level ' + berikut.id + ik('kanan') + '</a>'
        : '<a class="tombol tombol-utama" href="beranda.html">Kembali ke Beranda' + ik('kanan') + '</a>') +
      '<a class="tombol tombol-garis" href="latihan.html?level=' + level.id + '">' + ik('ulang') + 'Ulangi Level Ini</a>' +
      '<a class="tautan-level" href="beranda.html">' + ik('daftar') + 'Pilih Level Lain</a>' +
    '</div>';
  } else {
    aksi = '<div class="aksi-hasil tengah">' +
      '<div class="aksi-baris">' +
        '<a class="tombol tombol-utama" href="latihan.html?level=' + level.id + '">' + ik('ulang') + 'Coba Lagi Sekarang</a>' +
        (sebelum ? '<a class="tombol tombol-garis" href="latihan.html?level=' + sebelum.id + '">' + ik('kiri') + 'Kembali ke Level Sebelumnya</a>' : '') +
      '</div>' +
      '<a class="tautan-level" href="beranda.html">' + ik('daftar') + 'Pilih Level Lain di Kurikulum TKRO</a>' +
    '</div>';
  }

  document.getElementById('isi-hasil').innerHTML =
    bilah + status + '<section class="grid-nilai">' + kartuKecepatan + kartuAkurasi + '</section>' + kartuHuruf + aksi;
  document.title = (hasil.lulus ? 'Hasil Latihan (Lulus)' : 'Hasil Latihan (Belum Lulus)') + ' – TOTYPE';
}