/* =========================================================
   TOTYPE – data siswa yang sedang masuk dan progresnya
   Dipakai bersama oleh semua halaman setelah Masuk.
   Sementara disimpan di browser (localStorage). Saat pindah ke
   Firebase, cukup ganti isi muatProgres() dan simpanProgres().
   ========================================================= */
const Sesi = {
  ambilSiswa: function () {
    try { return JSON.parse(localStorage.getItem('totype:siswa')); } catch (e) { return null; }
  },

  keluar: function () {
    try { localStorage.removeItem('totype:siswa'); } catch (e) { /* abaikan */ }
    window.location.href = 'masuk.html';
  },

  // Halaman selain Masuk wajib punya siswa yang sudah masuk
  wajibMasuk: function () {
    const siswa = Sesi.ambilSiswa();
    if (!siswa) { window.location.href = 'masuk.html'; return null; }
    return siswa;
  },

  idSiswa: function (siswa) {
    return (siswa.kelas.split(' (')[0] + '_' + siswa.absen).replace(/[^a-zA-Z0-9_]/g, '');
  },

  progresBaru: function () {
    return {
      levelTerbuka: 1,   // level tertinggi yang sudah bisa dipilih
      levelLulus: [],    // id level yang sudah lulus
      riwayat: {}        // { '1': [ { akurasi, wpm, lulus, waktu } ] }
    };
  },

  muatProgres: function (siswa) {
    let data = null;
    try { data = JSON.parse(localStorage.getItem('totype:progres:' + Sesi.idSiswa(siswa))); } catch (e) { /* abaikan */ }
    return Object.assign(Sesi.progresBaru(), data || {});
  },

  simpanProgres: function (siswa, progres) {
    try { localStorage.setItem('totype:progres:' + Sesi.idSiswa(siswa), JSON.stringify(progres)); } catch (e) { /* abaikan */ }
  }
};
