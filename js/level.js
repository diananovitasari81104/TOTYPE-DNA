/* =========================================================
   TOTYPE – daftar level dan teks latihan
   Syarat lulus mengikuti tabel Tujuan Pembelajaran Terukur.
   - sorotan : true = tuts berikutnya disorot di keyboard virtual
   - timer   : true = hitung mundur (batas waktu dari target WPM)
   - latihan : satu teks dipilih acak setiap sesi
   ========================================================= */
const LEVELS = [
  {
    id: 1,
    nama: 'Baris Tengah',
    kategori: 'Teks latihan baris tengah',
    label: 'Huruf dasar',
    isi: 'A · S · D · F · J · K · L',
    isiHuruf: true,
    syarat: { akurasi: 90, wpm: 0 },
    catatanSyarat: '',
    sorotan: true,
    timer: false,
    latihan: [
      { kode: '1a', teks: 'fj fj fj dk dk dk sl sl sl af af af ds ds jf kd ls' },
      { kode: '1b', teks: 'ada alas lada jala kasa salak kala sala fada dasa' },
      { kode: '1c', teks: 'kasa jala dasa lada alas ada fakta salak sada kakak' }
    ]
  },
  {
    id: 2,
    nama: 'Baris Atas & Bawah',
    kategori: 'Teks latihan seluruh huruf',
    label: 'Semua alfabet',
    isi: 'Q W E R T Y U I O P & Z X C V B N M',
    isiHuruf: true,
    syarat: { akurasi: 90, wpm: 0 },
    catatanSyarat: '',
    sorotan: true,
    timer: false,
    latihan: [
      { kode: '2a', teks: 'qwe rty uio pqw ert yui opq tre wqe oiu ytr pwe uio' },
      { kode: '2b', teks: 'zxc vbn mzx cvb nmz xcv bnm zbc vnm xzc bvn mxz cbn' },
      { kode: '2c', teks: 'ba bi bu be bo ta ti tu te to ka ki ku ke ko ma mi' }
    ]
  },
  {
    id: 3,
    nama: 'Kata',
    kategori: 'Teks latihan komponen mesin',
    label: 'Kosakata bengkel otomotif',
    isi: 'oli, busi, rem, kopling, piston, radiator',
    isiHuruf: false,
    syarat: { akurasi: 85, wpm: 0 },
    catatanSyarat: 'tanpa sorotan keyboard',
    sorotan: false,
    timer: false,
    latihan: [
      { kode: '3A', teks: 'oli busi rem aki ban gas baut jok roda las' },
      { kode: '3B', teks: 'mesin pedal rantai kampas piston kopling filter lampu kabel starter' },
      { kode: '3C', teks: 'knalpot klakson radiator bantalan gardan pelek aki rem oli busi' }
    ]
  },
  {
    id: 4,
    nama: 'Kalimat',
    kategori: 'Teks latihan langkah servis',
    label: 'Langkah servis singkat',
    isi: 'kencangkan baut roda, ganti busi, bersihkan filter udara',
    isiHuruf: false,
    syarat: { akurasi: 90, wpm: 10 },
    catatanSyarat: '',
    sorotan: true,
    timer: false,
    latihan: [
      { kode: '4a', teks: 'Kencangkan baut roda sesuai urutan silang.' },
      { kode: '4b', teks: 'Mekanik mengganti busi yang sudah kotor dan aus.' },
      { kode: '4c', teks: 'Isi bak radiator dengan air sampai batas yang ditentukan.' },
      { kode: '4d', teks: 'Ukur celah busi dengan alat yang sesuai sebelum dipasang.' },
      { kode: '4e', teks: 'Pastikan rem berfungsi baik sebelum kendaraan diserahkan kepada pelanggan.' },
      { kode: '4f', teks: 'Bersihkan filter udara agar mesin bekerja lebih halus dan irit.' }
    ]
  },
  {
    id: 5,
    nama: 'Paragraf',
    kategori: 'Teks latihan prosedur bengkel',
    label: 'Prosedur bengkel',
    isi: 'servis berkala dan keselamatan kerja, dengan batas waktu',
    isiHuruf: false,
    syarat: { akurasi: 90, wpm: 15 },
    catatanSyarat: '',
    sorotan: false,
    timer: true,
    latihan: [
      { kode: '5a', teks: 'Servis berkala menjaga motor tetap awet. Mekanik memeriksa oli, busi, dan rem satu per satu. Hasil pemeriksaan dicatat agar pelanggan tahu kondisi kendaraannya.' },
      { kode: '5b', teks: 'Sebelum bekerja, mekanik memakai pakaian praktik dan sepatu pengaman. Peralatan disusun rapi di meja kerja. Setelah selesai, semua alat dibersihkan dan dikembalikan ke tempatnya.' }
    ]
  }
];

function teksSyarat(level) {
  let t = 'Syarat lulus: Akurasi ≥ ' + level.syarat.akurasi + '%';
  if (level.syarat.wpm) t += ', min. ' + level.syarat.wpm + ' WPM';
  if (level.catatanSyarat) t += ' ' + level.catatanSyarat;
  return t;
}
