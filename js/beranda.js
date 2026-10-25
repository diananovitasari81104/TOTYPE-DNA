/* =========================================================
   TOTYPE – halaman Beranda (Pilih Level Latihan)
   ========================================================= */
const siswa = Sesi.wajibMasuk();

if (siswa) {
  const progres = Sesi.muatProgres(siswa);

  /* ---------- Kepala: nama dan kelas siswa ---------- */
  document.getElementById('nama-siswa').textContent = siswa.nama;
  document.getElementById('kelas-siswa').textContent = siswa.kelas.split(' (')[0] + ' · Absen ' + siswa.absen;
  document.getElementById('avatar').textContent = siswa.nama.charAt(0).toUpperCase();
  document.getElementById('btn-keluar').addEventListener('click', Sesi.keluar);

  /* ---------- Progres belajar ---------- */
  const jumlahLulus = progres.levelLulus.length;
  const persen = Math.round(jumlahLulus / LEVELS.length * 100);
  document.getElementById('teks-progres').textContent = jumlahLulus + ' dari ' + LEVELS.length + ' Level (' + persen + '%)';
  document.getElementById('bar-progres').style.width = persen + '%';

  /* ---------- Daftar level ---------- */
  const IKON = {
    centang: '<path d="M5 12l5 5 9-10"/>',
    main: '<path d="M8 5v14l11-7z"/>',
    gembok: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    bendera: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    ulang: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    kanan: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function ik(nama) { return '<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">' + IKON[nama] + '</svg>'; }

  function akurasiTerbaik(id) {
    const data = progres.riwayat[String(id)] || [];
    return data.length ? Math.max.apply(null, data.map(function (d) { return d.akurasi; })) : null;
  }

  const html = LEVELS.map(function (lv) {
    const lulus = progres.levelLulus.indexOf(lv.id) !== -1;
    const terbuka = lv.id <= progres.levelTerbuka;
    const status = lulus ? 'lulus' : (terbuka ? 'aktif' : 'terkunci');

    let lencana, ikonStatus, ikonSyarat, tombol;
    if (status === 'lulus') {
      const terbaik = akurasiTerbaik(lv.id);
      lencana = '<span class="lencana hijau">' + ik('centang') + 'Selesai' + (terbaik !== null ? ' · Akurasi ' + terbaik + '%' : '') + '</span>';
      ikonStatus = ik('centang');
      ikonSyarat = ik('target');
      tombol = '<a class="tombol tombol-garis" href="latihan.html?level=' + lv.id + '">' + ik('ulang') + 'Latihan Ulang</a>';
    } else if (status === 'aktif') {
      lencana = '<span class="lencana biru"><i></i>Level aktif saat ini</span>';
      ikonStatus = ik('main');
      ikonSyarat = ik('bendera');
      tombol = '<a class="tombol tombol-utama" href="latihan.html?level=' + lv.id + '">Mulai Latihan' + ik('kanan') + '</a>';
    } else {
      lencana = '<span class="lencana abu">' + ik('gembok') + 'Terkunci</span>';
      ikonStatus = ik('gembok');
      ikonSyarat = ik('target');
      tombol = '<span class="tombol tombol-terkunci" aria-disabled="true">' + ik('gembok') + 'Terkunci</span>';
    }

    const isi = lv.isiHuruf ? '<span class="huruf-biru">' + lv.isi + '</span>' : lv.isi;
    const syarat = teksSyarat(lv) + (status === 'terkunci' ? ' · Selesaikan Level ' + (lv.id - 1) + ' untuk membuka' : '');

    return '<article class="kartu-level ' + status + '">' +
      '<div class="ikon-status">' + ikonStatus + '</div>' +
      '<div class="kartu-level-isi">' +
        '<div class="kartu-level-judul"><h2>Level ' + lv.id + ': ' + lv.nama + '</h2>' + lencana + '</div>' +
        '<p class="deskripsi">' + lv.label + ': ' + isi + '</p>' +
        '<p class="syarat">' + ikonSyarat + syarat + '</p>' +
      '</div>' +
      '<div class="kartu-level-aksi">' + tombol + '</div>' +
    '</article>';
  }).join('');

  document.getElementById('daftar-level').innerHTML = html;
}
