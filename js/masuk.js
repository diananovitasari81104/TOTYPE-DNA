/* =========================================================
   TOTYPE – halaman Masuk
   Memeriksa isian, menyimpan data siswa, lalu pindah ke Beranda.
   ========================================================= */
const form = document.getElementById('form-masuk');
const inNama = document.getElementById('in-nama');
const inAbsen = document.getElementById('in-absen');
const inKelas = document.getElementById('in-kelas');

// Nomor absen hanya boleh angka
inAbsen.addEventListener('input', function () {
  inAbsen.value = inAbsen.value.replace(/\D/g, '');
});

// Pesan salah hilang begitu siswa memperbaiki isian
[[inNama, 'err-nama'], [inAbsen, 'err-absen'], [inKelas, 'err-kelas']].forEach(function (pasangan) {
  const el = pasangan[0];
  el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
    tandai(el, pasangan[1], false);
  });
});

function tandai(el, idPesan, salah) {
  el.classList.toggle('salah', salah);
  document.getElementById(idPesan).classList.toggle('tampil', salah);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nama = inNama.value.trim().replace(/\s+/g, ' ');
  const absen = parseInt(inAbsen.value, 10);
  const kelas = inKelas.value;

  const namaSalah = nama.length < 3;
  const absenSalah = !(absen >= 1 && absen <= 36);
  const kelasSalah = !kelas;

  tandai(inNama, 'err-nama', namaSalah);
  tandai(inAbsen, 'err-absen', absenSalah);
  tandai(inKelas, 'err-kelas', kelasSalah);

  if (namaSalah || absenSalah || kelasSalah) {
    form.querySelector('.input.salah').focus();
    return;
  }

  // Sementara disimpan di browser; nanti diganti Firebase
  const siswa = { nama: nama, absen: absen, kelas: kelas };
  try { localStorage.setItem('totype:siswa', JSON.stringify(siswa)); } catch (err) { /* abaikan */ }

  window.location.href = 'beranda.html';
});

inNama.focus();
