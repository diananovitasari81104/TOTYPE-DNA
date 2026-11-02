/* =========================================================
   TOTYPE – halaman Papan Peringkat
   Peringkat per kelas, berdasarkan poin minggu ini.
   ========================================================= */
const siswa = Sesi.wajibMasuk();
if (siswa) tampilkanPeringkat();

function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// "Budi Santoso" → "Budi S." (nama lengkap tidak ditampilkan ke teman sekelas)
function namaSingkat(nama) {
  const bagian = nama.trim().split(/\s+/);
  return bagian.length > 1 ? bagian[0] + ' ' + bagian[bagian.length - 1].charAt(0).toUpperCase() + '.' : bagian[0];
}

// "2–8 Nov 2026" dari tanggal Senin minggu ini
function teksRentangMinggu() {
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const senin = new Date(Sesi.kunciMingguIni() + 'T00:00:00');
  const minggu = new Date(senin); minggu.setDate(senin.getDate() + 6);
  const kiri = senin.getDate() + (senin.getMonth() !== minggu.getMonth() ? ' ' + BULAN[senin.getMonth()] : '');
  return kiri + '–' + minggu.getDate() + ' ' + BULAN[minggu.getMonth()] + ' ' + minggu.getFullYear();
}

async function tampilkanPeringkat() {
  /* ---------- Kepala ---------- */
  const kelasPendek = siswa.kelas.split(' (')[0];
  document.getElementById('nama-siswa').textContent = siswa.nama;
  document.getElementById('kelas-siswa').textContent = kelasPendek + ' · Absen ' + siswa.absen;
  document.getElementById('avatar').textContent = siswa.nama.charAt(0).toUpperCase();
  document.getElementById('btn-keluar').addEventListener('click', Sesi.keluar);
  document.getElementById('pil-kelas').textContent = 'Kelas ' + kelasPendek;
  document.getElementById('rentang-minggu').textContent = teksRentangMinggu();

  /* ---------- Aturan poin (dari js/level.js) ---------- */
  document.getElementById('daftar-aturan').innerHTML =
    '<li><b>+' + POIN.selesai + '</b> setiap menyelesaikan satu latihan</li>' +
    '<li><b>+' + POIN.tepat + '</b> kalau akurasinya memenuhi syarat lulus level itu</li>' +
    '<li><b>+' + POIN.naik + '</b> kalau akurasinya lebih baik dari rekormu sendiri</li>' +
    '<li><b>+' + POIN.lulusBaru + '</b> saat lulus sebuah level untuk pertama kali</li>';
  document.getElementById('akurasi-min').textContent = AKURASI_MIN + '%';

  /* ---------- Ambil data satu kelas ---------- */
  const wadah = document.getElementById('isi-peringkat');
  let daftar;
  try {
    daftar = await Sesi.muatPeringkat(siswa.kelas);
  } catch (err) {
    console.error(err);
    wadah.innerHTML = '<p class="status-muat gagal">Gagal memuat papan peringkat. Periksa koneksi internet. ' +
      '<button class="tombol tombol-garis" type="button" onclick="location.reload()">Coba lagi</button></p>';
    return;
  }

  const idSaya = Sesi.idSiswa(siswa);
  const berpoin = daftar.filter(function (d) { return d.poin > 0; });
  const posisi = berpoin.findIndex(function (d) { return d.id === idSaya; });
  const saya = daftar.find(function (d) { return d.id === idSaya; }) || { poin: 0 };

  /* ---------- Kartu posisimu ---------- */
  let teksPosisi, teksDorongan;
  if (posisi === -1) {
    teksPosisi = '<b class="peringkat-besar">–</b>';
    teksDorongan = 'Kamu belum punya poin minggu ini. Selesaikan satu latihan untuk masuk papan peringkat.';
  } else if (posisi === 0) {
    teksPosisi = '<b class="peringkat-besar">#1</b>';
    teksDorongan = 'Kamu di posisi teratas kelas minggu ini. Pertahankan ketelitianmu!';
  } else {
    const selisih = berpoin[posisi - 1].poin - saya.poin + 1;
    teksPosisi = '<b class="peringkat-besar">#' + (posisi + 1) + '</b>';
    teksDorongan = 'Kurang <b>' + selisih + ' poin</b> lagi untuk naik ke peringkat ' + posisi + '. Satu latihan lagi bisa cukup!';
  }
  const kartuSaya =
    '<section class="kartu-saya">' +
      '<div class="kartu-saya-kiri"><span class="label-kecil">Posisimu</span>' + teksPosisi + '</div>' +
      '<div class="kartu-saya-tengah"><span class="label-kecil">Poin minggu ini</span><b>' + saya.poin + '</b></div>' +
      '<p>' + teksDorongan + '</p>' +
      '<a class="tombol tombol-utama" href="beranda.html">Latihan Sekarang</a>' +
    '</section>';

  /* ---------- Belum ada yang punya poin ---------- */
  if (!berpoin.length) {
    wadah.innerHTML = kartuSaya +
      '<section class="kosong-peringkat"><b>Papan peringkat masih kosong</b>' +
      '<p>Belum ada siswa ' + esc(kelasPendek) + ' yang berlatih minggu ini. Jadilah yang pertama!</p></section>';
    return;
  }

  /* ---------- Tiga besar ---------- */
  const tigaBesar = berpoin.slice(0, 3);
  const urutanPodium = [1, 0, 2].filter(function (i) { return tigaBesar[i]; }); // juara 2, 1, 3
  const podium = '<section class="podium">' + urutanPodium.map(function (i) {
    const d = tigaBesar[i];
    const ini = d.id === idSaya;
    return '<div class="podium-item juara-' + (i + 1) + (ini ? ' saya' : '') + '">' +
      '<div class="medali">' + (i + 1) + '</div>' +
      '<div class="avatar-besar">' + esc(d.nama.charAt(0).toUpperCase()) + '</div>' +
      '<b>' + esc(namaSingkat(d.nama)) + (ini ? ' <span class="tag-saya">Kamu</span>' : '') + '</b>' +
      '<span class="poin-podium">' + d.poin + ' poin</span>' +
      '<small>' + d.levelLulus + ' level lulus</small>' +
      '<div class="alas"></div>' +
    '</div>';
  }).join('') + '</section>';

  /* ---------- Peringkat 4–10 ---------- */
  const sisanya = berpoin.slice(3, 10);
  const baris = sisanya.map(function (d, i) {
    const ini = d.id === idSaya;
    return '<tr' + (ini ? ' class="saya"' : '') + '>' +
      '<td class="kolom-no">' + (i + 4) + '</td>' +
      '<td><span class="avatar-kecil">' + esc(d.nama.charAt(0).toUpperCase()) + '</span>' + esc(namaSingkat(d.nama)) + (ini ? ' <span class="tag-saya">Kamu</span>' : '') + '</td>' +
      '<td>' + d.levelLulus + ' / ' + LEVELS.length + '</td>' +
      '<td>' + d.jumlahLatihan + '</td>' +
      '<td class="kolom-poin">' + d.poin + '</td>' +
    '</tr>';
  }).join('');
  // Kalau posisimu di luar 10 besar, tampilkan barismu di bawah tabel
  const barisSaya = posisi >= 10
    ? '<tr class="pemisah"><td colspan="5">···</td></tr><tr class="saya"><td class="kolom-no">' + (posisi + 1) + '</td>' +
      '<td><span class="avatar-kecil">' + esc(saya.nama.charAt(0).toUpperCase()) + '</span>' + esc(namaSingkat(saya.nama)) + ' <span class="tag-saya">Kamu</span></td>' +
      '<td>' + saya.levelLulus + ' / ' + LEVELS.length + '</td><td>' + saya.jumlahLatihan + '</td><td class="kolom-poin">' + saya.poin + '</td></tr>'
    : '';
  const tabel = (sisanya.length || barisSaya)
    ? '<section class="kartu-tabel"><table>' +
        '<thead><tr><th>#</th><th>Siswa</th><th>Level lulus</th><th>Latihan</th><th class="kolom-poin">Poin</th></tr></thead>' +
        '<tbody>' + baris + barisSaya + '</tbody></table></section>'
    : '';

  wadah.innerHTML = kartuSaya + podium + tabel;
}
