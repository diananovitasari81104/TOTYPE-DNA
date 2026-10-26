/* =========================================================
   TOTYPE – halaman Statistik
   Membaca riwayat latihan siswa (progres.riwayat, disimpan oleh
   latihan.js) lalu menampilkan angka ringkas, grafik perkembangan,
   progres level, huruf yang sering salah, riwayat, dan langkah berikutnya.
   Sesi lama yang belum menyimpan durasi / huruf salah ditampilkan "–".
   ========================================================= */
const siswa = Sesi.wajibMasuk();

function $(id) { return document.getElementById(id); }
function buat(tag, kelas, teks) {
  const el = document.createElement(tag);
  if (kelas) el.className = kelas;
  if (teks !== undefined) el.textContent = teks;
  return el;
}
function namaLevel(lv) { return lv.id + ': ' + lv.nama; }
function pad(n) { return (n < 10 ? '0' : '') + n; }

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function tanggalPendek(d) { return d.getDate() + ' ' + BULAN_PENDEK[d.getMonth()] + ' ' + d.getFullYear(); }
function jam(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function rentang(a, b) {
  if (a.toDateString() === b.toDateString()) return a.getDate() + ' ' + BULAN[a.getMonth()] + ' ' + a.getFullYear();
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    return a.getDate() + '–' + b.getDate() + ' ' + BULAN[a.getMonth()] + ' ' + a.getFullYear();
  return a.getDate() + ' ' + BULAN_PENDEK[a.getMonth()] + ' – ' + b.getDate() + ' ' + BULAN_PENDEK[b.getMonth()] + ' ' + b.getFullYear();
}
function durasi(detik) { return pad(Math.floor(detik / 60)) + ':' + pad(detik % 60); }
function gabung(arr) {
  if (arr.length <= 1) return arr.join('');
  return arr.slice(0, -1).join(', ') + (arr.length > 2 ? ', dan ' : ' dan ') + arr[arr.length - 1];
}
function levelDari(id) { return LEVELS.find(function (l) { return l.id === id; }); }

function syaratLevel(lv) {
  let t = 'Syarat lulus Level ' + lv.id + ': akurasi ≥ ' + lv.syarat.akurasi + '%';
  if (lv.syarat.wpm) t += ' dan minimal ' + lv.syarat.wpm + ' KPM';
  if (lv.catatanSyarat) t += ', ' + lv.catatanSyarat;
  return t;
}

/* Level pertama yang menilai kecepatan (KPM) */
const levelKpm = LEVELS.find(function (l) { return l.syarat.wpm > 0; });

function mulai() {
  const progres = Sesi.muatProgres(siswa);

  /* ---------- Kepala ---------- */
  $('nama-siswa').textContent = siswa.nama;
  $('kelas-siswa').textContent = siswa.kelas.split(' (')[0] + ' · Absen ' + siswa.absen;
  $('avatar').textContent = siswa.nama.charAt(0).toUpperCase();
  $('btn-keluar').addEventListener('click', Sesi.keluar);
  const namaDepan = siswa.nama.split(' ')[0];
  $('sapaan').textContent = 'Setiap latihan adalah kemajuan, ' + namaDepan + '. Yuk, lihat hal yang sudah baik dan yang bisa dilatih lagi.';

  /* ---------- Gabungkan semua sesi, urut waktu ---------- */
  const semua = [];
  Object.keys(progres.riwayat).forEach(function (k) {
    (progres.riwayat[k] || []).forEach(function (d) {
      semua.push(Object.assign({ level: parseInt(k, 10) }, d));
    });
  });
  semua.sort(function (a, b) { return new Date(a.waktu) - new Date(b.waktu); });
  semua.forEach(function (d, i) { d.no = i + 1; d.tgl = new Date(d.waktu); });

  if (!semua.length) { $('kosong').hidden = false; $('meta-kiri').textContent = 'Belum ada sesi latihan'; return; }
  $('isi-data').hidden = false;

  const akhir = semua[semua.length - 1];
  const lvAkhir = levelDari(akhir.level);

  $('meta-kiri').textContent = 'Akurasi & kecepatan dari sesi terakhir • Level ' + namaLevel(lvAkhir);
  $('meta-tanggal').textContent = rentang(semua[0].tgl, akhir.tgl);

  angkaRingkas(semua, akhir, lvAkhir);
  grafikPerkembangan(semua, akhir, lvAkhir);
  progresLevel(progres, semua);
  hurufSalah(akhir, lvAkhir);
  riwayat(semua);
  langkahBerikut(progres, akhir, lvAkhir);
}

/* ================= Empat angka ================= */
function satuan(angka, unit) {
  const b = $(angka);
  b.textContent = '';
  return function (nilai, u) {
    b.appendChild(document.createTextNode(nilai));
    if (u) b.appendChild(buat('small', 'satuan', ' ' + u));
  };
}

function angkaRingkas(semua, akhir, lvAkhir) {
  $('a-akurasi').textContent = akhir.akurasi + '%';
  $('a-akurasi-ket').textContent = (akhir.tuts !== undefined)
    ? akhir.salah + ' salah dari ' + akhir.tuts + ' tuts'
    : 'Dari sesi terakhir';

  if (lvAkhir.syarat.wpm > 0 || akhir.wpm > 0) {
    satuan('a-kpm')(String(akhir.wpm), 'KPM');
    $('a-kpm-ket').textContent = 'KPM = kata per menit';
  } else {
    $('a-kpm').textContent = '–';
    $('a-kpm-ket').textContent = levelKpm ? 'Dinilai mulai Level ' + levelKpm.id : 'KPM = kata per menit';
  }

  satuan('a-sesi')(String(semua.length), 'sesi');

  const berdurasi = semua.filter(function (d) { return typeof d.detik === 'number'; });
  if (berdurasi.length) {
    const total = berdurasi.reduce(function (t, d) { return t + d.detik; }, 0);
    const tulis = satuan('a-waktu');
    tulis(String(Math.floor(total / 60)), 'mnt');
    tulis(' ' + (total % 60), 'dtk');
    $('a-waktu-ket').textContent = 'Total durasi dari ' + berdurasi.length + ' sesi';
  } else {
    $('a-waktu').textContent = '–';
    $('a-waktu-ket').textContent = 'Durasi dicatat mulai sesi berikutnya';
  }
}

/* ================= Grafik ================= */
function grafikSVG(o) {
  const W = 340, H = 190, L = 40, R = 18, T = 28, B = 30;
  const iw = W - L - R, ih = H - T - B, n = o.nilai.length;
  const x = function (i) { return n === 1 ? L + iw / 2 : L + iw * i / (n - 1); };
  const y = function (v) { return T + ih * (1 - (v - o.lo) / (o.hi - o.lo)); };
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + o.alt + '">';
  const langkah = (o.hi - o.lo) / o.garis;
  for (let k = 0; k <= o.garis; k++) {
    const v = o.lo + langkah * k;
    s += '<line class="g-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
         '<text class="g-sumbu" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + Math.round(v) + o.akhiran + '</text>';
  }
  if (o.syarat) s += '<line class="g-syarat" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(o.syarat) + '" y2="' + y(o.syarat) + '"/>';
  s += '<polyline class="g-garis" points="' + o.nilai.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ') + '"/>';
  o.nilai.forEach(function (v, i) {
    s += '<circle class="g-titik" cx="' + x(i) + '" cy="' + y(v) + '" r="3.5"><title>' + o.label[i] + ': ' + v + o.akhiran + '</title></circle>' +
         '<text class="g-nilai" x="' + x(i) + '" y="' + (y(v) - 9) + '" text-anchor="middle">' + v + '</text>' +
         '<text class="g-sumbu" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + o.label[i] + '</text>';
  });
  return s + '</svg>';
}

function kartuGrafik(judul, delta, legenda, svg, catatan) {
  const k = buat('article', 'kartu kartu-grafik');
  const atas = buat('div', 'grafik-atas');
  atas.appendChild(buat('h3', '', judul));
  atas.appendChild(buat('b', 'delta', delta));
  k.appendChild(atas);
  const leg = buat('div', 'legenda');
  legenda.forEach(function (l) {
    const sp = buat('span', 'leg ' + l.kelas);
    sp.appendChild(buat('i'));
    sp.appendChild(document.createTextNode(l.teks));
    leg.appendChild(sp);
  });
  k.appendChild(leg);
  const wadah = buat('div', 'grafik-svg');
  wadah.innerHTML = svg;   // svg dibuat dari angka dan teks tetap, bukan dari isian siswa
  k.appendChild(wadah);
  k.appendChild(buat('p', 'grafik-catatan', catatan));
  return k;
}

function selisih(arr) { return arr[arr.length - 1] - arr[0]; }
function tandaDelta(d, unit) { return (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d) + ' ' + unit; }

function grafikPerkembangan(semua, akhir, lv) {
  const sesiLevel = semua.filter(function (d) { return d.level === akhir.level; }).slice(-6);
  $('grafik-level').textContent = 'Level ' + namaLevel(lv);
  const wadah = $('dua-grafik');
  wadah.textContent = '';

  if (sesiLevel.length < 2) {
    $('grafik-sub').textContent = 'Perbandingan sesi di level yang sama, bukan antarlevel.';
    const p = buat('div', 'kartu grafik-kosong');
    p.appendChild(buat('b', '', 'Butuh minimal 2 sesi di Level ' + namaLevel(lv)));
    p.appendChild(buat('span', '', 'Selesaikan satu latihan lagi di level ini, lalu perkembanganmu akan tergambar di sini.'));
    wadah.appendChild(p);
    wadah.classList.add('satu');
  } else {
    wadah.classList.remove('satu');
    $('grafik-sub').textContent = 'Perbandingan ' + sesiLevel.length + ' sesi di level yang sama, bukan antarlevel.';
    const label = sesiLevel.map(function (d) { return 'Sesi ' + d.no; });

    /* --- Akurasi --- */
    const ak = sesiLevel.map(function (d) { return d.akurasi; });
    const sAk = lv.syarat.akurasi;
    let loAk = Math.max(0, Math.floor((Math.min.apply(null, ak.concat(sAk)) - 5) / 10) * 10);
    loAk = Math.min(loAk, 80);
    const garisAk = Math.round((100 - loAk) / (100 - loAk > 40 ? 20 : 10));
    const dAk = selisih(ak);
    let catAk;
    const dua = ak.length >= 2 && ak[ak.length - 1] >= sAk && ak[ak.length - 2] >= sAk;
    if (dua) catAk = 'Semakin teliti! Dua sesi terakhir sudah mencapai akurasi ≥' + sAk + '%.';
    else if (ak[ak.length - 1] >= sAk) catAk = 'Sesi terakhir sudah mencapai akurasi ≥' + sAk + '%. Pertahankan!';
    else if (dAk > 0) catAk = 'Akurasi naik. Tinggal ' + (sAk - ak[ak.length - 1]) + ' poin lagi menuju syarat ' + sAk + '%.';
    else catAk = 'Pelan-pelan saja. Fokus pada jari yang tepat untuk setiap tuts.';
    wadah.appendChild(kartuGrafik('Akurasi ketikan', tandaDelta(dAk, 'poin'),
      [{ kelas: 'l-garis', teks: 'Akurasi (%)' }, { kelas: 'l-syarat', teks: 'Syarat lulus: ' + sAk + '%' }],
      grafikSVG({ nilai: ak, label: label, syarat: sAk, lo: loAk, hi: 100, garis: garisAk, akhiran: '%', alt: 'Grafik akurasi per sesi' }),
      catAk));

    /* --- Kecepatan --- */
    if (lv.syarat.wpm > 0) {
      const kp = sesiLevel.map(function (d) { return d.wpm; });
      const sKp = lv.syarat.wpm;
      const loKp = Math.max(0, Math.floor((Math.min.apply(null, kp.concat(sKp)) - 2) / 2) * 2);
      let hiKp = Math.ceil((Math.max.apply(null, kp.concat(sKp)) + 1) / 2) * 2;
      const lang = Math.max(1, Math.ceil((hiKp - loKp) / 3));
      hiKp = loKp + lang * 3;
      const dKp = selisih(kp);
      const catKp = dKp > 0 ? 'Kecepatan bertambah bertahap. Tetap utamakan ketepatan.'
                            : 'Kecepatan belum naik, tidak apa-apa. Utamakan ketepatan dulu.';
      wadah.appendChild(kartuGrafik('Kecepatan mengetik', tandaDelta(dKp, 'KPM'),
        [{ kelas: 'l-garis', teks: 'Kecepatan (KPM)' }, { kelas: 'l-syarat', teks: 'Syarat lulus: ' + sKp + ' KPM' }],
        grafikSVG({ nilai: kp, label: label, syarat: sKp, lo: loKp, hi: hiKp, garis: 3, akhiran: '', alt: 'Grafik kecepatan per sesi' }),
        catKp));
    } else {
      const p = buat('article', 'kartu grafik-kosong');
      p.appendChild(buat('b', '', 'Kecepatan belum dinilai di level ini'));
      p.appendChild(buat('span', '', 'Pada level ini yang dilatih adalah ketepatan. Kecepatan (KPM) mulai dinilai' + (levelKpm ? ' di Level ' + levelKpm.id + '.' : '.')));
      wadah.appendChild(p);
    }
  }

  $('catatan-kpm').textContent = levelKpm
    ? 'Sebelum Level ' + levelKpm.id + ', yang dilatih adalah ketepatan. KPM mulai dinilai pada Level ' + levelKpm.id + '.'
    : '';
}

/* ================= Progres level ================= */
function progresLevel(progres, semua) {
  const lulus = progres.levelLulus.length;
  const persen = Math.round(lulus / LEVELS.length * 100);
  $('progres-teks').textContent = lulus + ' dari ' + LEVELS.length + ' level selesai (' + persen + '%)';
  $('progres-bar').style.width = persen + '%';

  const IK = {
    centang: '<path d="M5 12l5 5 9-10"/>',
    main: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
    gembok: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  const kisi = $('kisi-level');
  kisi.textContent = '';

  LEVELS.forEach(function (lv) {
    const sudahLulus = progres.levelLulus.indexOf(lv.id) !== -1;
    const terbuka = lv.id <= progres.levelTerbuka;
    const status = sudahLulus ? 'lulus' : (terbuka ? 'aktif' : 'terkunci');
    const sesiLv = semua.filter(function (d) { return d.level === lv.id; });
    let terbaik = null;
    sesiLv.forEach(function (d) { if (!terbaik || d.akurasi > terbaik.akurasi) terbaik = d; });

    const k = buat('div', 'mini-level ' + status);
    const atas = buat('div', 'mini-atas');
    atas.appendChild(buat('span', 'mini-label', 'LEVEL ' + lv.id));
    const ik = buat('i', 'mini-ikon');
    ik.innerHTML = '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">' + IK[status === 'lulus' ? 'centang' : status === 'aktif' ? 'main' : 'gembok'] + '</svg>';
    atas.appendChild(ik);
    k.appendChild(atas);
    k.appendChild(buat('b', 'mini-nama', lv.nama));

    let status1, status2;
    if (status === 'lulus') {
      status1 = 'Selesai';
      status2 = terbaik ? ('Akurasi ' + terbaik.akurasi + '%' + (lv.syarat.wpm > 0 ? ' • ' + terbaik.wpm + ' KPM' : '')) : '';
    } else if (status === 'aktif') {
      status1 = 'Terbuka';
      status2 = terbaik ? (sesiLv.length + ' sesi • terbaik ' + terbaik.akurasi + '%') : 'Belum dimulai';
    } else {
      status1 = 'Terkunci';
      status2 = 'Selesaikan Level ' + (lv.id - 1);
    }
    k.appendChild(buat('span', 'mini-status', status1));
    k.appendChild(buat('small', 'mini-ket', status2));
    kisi.appendChild(k);
  });
}

/* ================= Huruf yang sering salah ================= */
function hurufSalah(akhir, lv) {
  let daftar = akhir.hurufSalah;
  // Cadangan untuk sesi terakhir yang belum menyimpan huruf salah di riwayat
  if (!daftar) {
    try {
      const h = JSON.parse(localStorage.getItem('totype:hasil'));
      if (h && h.level === akhir.level && h.kode === akhir.kode) daftar = h.hurufSalah;
    } catch (e) { /* abaikan */ }
  }
  const kisi = $('kisi-salah');
  kisi.textContent = '';

  if (!daftar) {
    $('salah-sub').textContent = 'Dari sesi terakhir • Level ' + namaLevel(lv);
    kisi.appendChild(buat('p', 'tidak-ada', 'Sesi terakhir belum mencatat huruf yang salah. Selesaikan satu latihan lagi.'));
    $('tips-salah').hidden = true;
    return;
  }
  $('tips-salah').hidden = false;

  const total = (typeof akhir.salah === 'number') ? akhir.salah : daftar.reduce(function (t, d) { return t + d.jumlah; }, 0);
  $('salah-sub').textContent = 'Dari sesi terakhir • Level ' + namaLevel(lv) + ' • ' + total + ' kesalahan';

  if (!daftar.length) {
    kisi.appendChild(buat('p', 'tidak-ada', 'Tidak ada huruf yang salah pada sesi terakhir. Pertahankan!'));
    $('tips-teks').textContent = 'Tips Mekanik: Pertahankan posisi jari di baris tengah, lalu coba naik ke level berikutnya.';
    return;
  }

  daftar.forEach(function (d) {
    const kartu = buat('div', 'kartu-huruf');
    const tuts = buat('div', 'tuts-besar');
    const hurufEl = buat('b', d.huruf.length > 1 ? 'panjang' : '', d.huruf);
    tuts.appendChild(hurufEl);
    tuts.appendChild(buat('small', '', 'TUTS'));
    kartu.appendChild(tuts);
    const info = buat('div', 'huruf-info');
    info.appendChild(buat('span', 'jumlah-salah', d.jumlah + ' kali salah'));
    info.appendChild(buat('b', '', namaJari(jariUntuk(d.huruf))));
    info.appendChild(buat('small', '', barisUntuk(d.huruf).replace(/\s*\(.*\)/, '')));
    kartu.appendChild(info);
    kisi.appendChild(kartu);
  });

  const daftarHuruf = daftar.map(function (d) { return d.huruf; });
  $('tips-teks').textContent = '';
  const b = buat('b', '', 'Tips Mekanik: ');
  $('tips-teks').appendChild(b);
  $('tips-teks').appendChild(document.createTextNode(
    'Latih ' + gabung(daftarHuruf) + ' perlahan, lalu kembali ke posisi awal. Panduan ini menunjukkan jari yang disarankan untuk setiap tuts.'));
}

/* ================= Riwayat ================= */
function riwayat(semua) {
  $('riwayat-sub').textContent = 'Semua ' + semua.length + ' sesi selesai • Terbaru di atas';
  $('riwayat-tanggal').textContent = rentang(semua[0].tgl, semua[semua.length - 1].tgl);
  const isi = $('tabel-isi');
  isi.textContent = '';

  semua.slice().reverse().forEach(function (d) {
    const lv = levelDari(d.level);
    const baris = buat('div', 'tabel-baris');
    baris.setAttribute('role', 'row');

    const c1 = buat('span', 'sel-tanggal');
    c1.appendChild(buat('b', '', tanggalPendek(d.tgl)));
    c1.appendChild(buat('small', '', 'Sesi ' + d.no + ' • ' + jam(d.tgl)));
    const c2 = buat('span', '', namaLevel(lv));
    const c3 = buat('span', '', typeof d.detik === 'number' ? durasi(d.detik) : '–');
    const c4 = buat('span', '', lv.syarat.wpm > 0 ? String(d.wpm) : '–');
    const c5 = buat('span', '', d.akurasi + '%');
    const c6 = buat('span');
    c6.appendChild(buat('em', 'chip ' + (d.lulus ? 'lulus' : 'belum'), d.lulus ? 'Lulus' : 'Belum lulus'));

    [c1, c2, c3, c4, c5, c6].forEach(function (c) { c.setAttribute('role', 'cell'); baris.appendChild(c); });
    isi.appendChild(baris);
  });
}

/* ================= Langkah berikutnya ================= */
function langkahBerikut(progres, akhir, lv) {
  const nama = siswa.nama.split(' ')[0];
  const berikut = levelDari(lv.id + 1);
  const huruf = (akhir.hurufSalah || []).map(function (d) { return d.huruf; });
  const aksi = $('langkah-aksi');
  aksi.textContent = '';

  function tombolUtama(teks, href) {
    const a = buat('a', 'tombol tombol-utama', teks);
    a.href = href;
    a.insertAdjacentHTML('beforeend', '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>');
    aksi.appendChild(a);
  }
  function tautan(teks, href) { const a = buat('a', 'tautan-ulang', teks); a.href = href; aksi.appendChild(a); }

  const latihLagi = huruf.length ? 'Latih lagi ' + gabung(huruf) + ' di Level ' + lv.id + ' bila perlu, lalu ' : '';

  if (akhir.lulus && berikut) {
    $('langkah-judul').textContent = 'Siap mencoba Level ' + namaLevel(berikut);
    $('langkah-teks').textContent = 'Bagus, ' + nama + '! ' + latihLagi + (latihLagi ? 'lanjut ke ' : 'Lanjut ke ') +
      berikut.label.toLowerCase() + '. Ketepatan dulu, kecepatan menyusul.';
    $('langkah-syarat').textContent = syaratLevel(berikut);
    tombolUtama('Lanjut ke Level ' + berikut.id, 'latihan.html?level=' + berikut.id);
    tautan('Ulangi Level ' + lv.id, 'latihan.html?level=' + lv.id);
  } else if (akhir.lulus) {
    $('langkah-judul').textContent = 'Semua level sudah kamu selesaikan';
    $('langkah-teks').textContent = 'Hebat, ' + nama + '! Ulangi latihan kapan saja untuk menjaga kecepatan dan ketepatan.';
    $('langkah-syarat').textContent = '';
    tombolUtama('Pilih Level', 'beranda.html');
  } else {
    $('langkah-judul').textContent = 'Ayo ulangi Level ' + namaLevel(lv);
    $('langkah-teks').textContent = 'Kamu sudah di jalur yang benar, ' + nama + '. ' + latihLagi + (latihLagi ? 'coba lagi' : 'Coba lagi') + ' dengan tenang. Ketepatan dulu, kecepatan menyusul.';
    $('langkah-syarat').textContent = syaratLevel(lv);
    tombolUtama('Ulangi Level ' + lv.id, 'latihan.html?level=' + lv.id);
    tautan('Pilih Level', 'beranda.html');
  }
}

/* Jalankan setelah semua konstanta dan fungsi di atas siap */
if (siswa) mulai();
