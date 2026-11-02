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

const tombol = form.querySelector('button[type=submit]');
const teksTombolAwal = tombol.innerHTML;
const errUmum = document.getElementById('err-umum');

function tampilkanErrUmum(pesan) {
  errUmum.textContent = pesan;
  errUmum.classList.toggle('tampil', !!pesan);
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  tampilkanErrUmum('');

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

  const siswa = { nama: nama, absen: absen, kelas: kelas };

  // Tombol menunjukkan sedang memproses
  tombol.disabled = true;
  tombol.textContent = 'Menghubungkan...';

  try {
    // Login anonim ke Firebase, lalu buat/cocokkan data siswa di Firestore
    await Sesi.daftarkan(siswa);
    Sesi.simpanSiswaLokal(siswa);
    window.location.href = 'beranda.html';
  } catch (err) {
    console.error(err);
    if (err.kode === 'nama-beda') {
      inAbsen.classList.add('salah');
      tampilkanErrUmum('Kelas dan nomor absen ini sudah terdaftar atas nama lain. Periksa lagi kelas dan nomor absenmu, atau tanyakan ke guru.');
    } else {
      tampilkanErrUmum('Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.');
    }
    tombol.disabled = false;
    tombol.innerHTML = teksTombolAwal;
  }
});

inNama.focus();
