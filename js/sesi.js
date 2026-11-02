/* =========================================================
   TOTYPE – data siswa dan progres (Firebase Firestore)
   Dipakai bersama oleh semua halaman.

   Struktur data di Firestore:
     siswa/{KELAS_ABSEN}                 contoh: siswa/XTKRO1_14
       nama, kelas, absen,
       levelTerbuka, levelLulus, terbaik, jumlahLatihan,
       poinMingguan, kunciMinggu, poinTotal,   ← untuk papan peringkat
       dibuat, diperbaruiPada
     siswa/{KELAS_ABSEN}/riwayat/{id}    satu dokumen per sesi latihan
       level, akurasi, wpm, lulus, kode, totalTuts, tutsSalah,
       hurufSalah, detik, waktu

   Siswa yang sedang masuk di komputer ini tetap dicatat di
   localStorage ('totype:siswa') supaya tidak perlu masuk ulang
   setiap pindah halaman.
   ========================================================= */
const Sesi = {

  /* ---------- Siswa yang sedang masuk (di komputer ini) ---------- */
  ambilSiswa: function () {
    try { return JSON.parse(localStorage.getItem('totype:siswa')); } catch (e) { return null; }
  },

  simpanSiswaLokal: function (siswa) {
    try { localStorage.setItem('totype:siswa', JSON.stringify(siswa)); } catch (e) { /* abaikan */ }
  },

  keluar: function () {
    try {
      localStorage.removeItem('totype:siswa');
      localStorage.removeItem('totype:hasil');
    } catch (e) { /* abaikan */ }
    window.location.href = 'masuk.html';
  },

  // Halaman selain Masuk wajib punya siswa yang sudah masuk
  wajibMasuk: function () {
    const siswa = Sesi.ambilSiswa();
    if (!siswa) { window.location.href = 'masuk.html'; return null; }
    return siswa;
  },

  // Id dokumen: kelas tanpa keterangan jurusan + nomor absen → 'XTKRO1_14'
  idSiswa: function (siswa) {
    return (siswa.kelas.split(' (')[0] + '_' + siswa.absen).replace(/[^a-zA-Z0-9_]/g, '');
  },

  refSiswa: function (siswa) {
    return db.collection('siswa').doc(Sesi.idSiswa(siswa));
  },

  progresBaru: function () {
    return {
      levelTerbuka: 1,     // level tertinggi yang sudah bisa dipilih
      levelLulus: [],      // id level yang sudah lulus
      terbaik: {},         // akurasi terbaik per level, contoh { '1': 94 }
      jumlahLatihan: 0,    // jumlah sesi latihan yang selesai
      poinMingguan: 0,     // poin minggu ini (untuk papan peringkat)
      kunciMinggu: '',     // tanggal Senin minggu poinMingguan dihitung, contoh '2026-11-02'
      poinTotal: 0         // poin sejak awal
    };
  },

  // Tanggal Senin minggu ini (waktu komputer), contoh '2026-11-02'.
  // Poin mingguan otomatis dianggap 0 kalau kunciMinggu-nya bukan minggu ini.
  kunciMingguIni: function () {
    const d = new Date();
    const mundur = (d.getDay() + 6) % 7;          // Senin = 0, Minggu = 6
    d.setDate(d.getDate() - mundur);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  /* ---------- Login anonim Firebase ---------- */
  // Dipanggil sebelum membaca/menulis Firestore. Kalau belum login, login anonim dulu.
  siapkan: function () {
    return new Promise(function (resolve, reject) {
      const berhenti = auth.onAuthStateChanged(function (user) {
        berhenti();
        if (user) { resolve(user); return; }
        auth.signInAnonymously().then(function (c) { resolve(c.user); }).catch(reject);
      }, reject);
    });
  },

  /* ---------- Halaman Masuk: daftarkan atau cocokkan siswa ---------- */
  // Hasil: 'baru' (dokumen dibuat), 'lama' (siswa sudah terdaftar),
  // atau melempar error dengan kode 'nama-beda' bila kelas+absen dipakai nama lain.
  daftarkan: async function (siswa) {
    await Sesi.siapkan();
    const ref = Sesi.refSiswa(siswa);
    const snap = await ref.get();

    if (snap.exists) {
      const namaTersimpan = (snap.data().nama || '').trim().toLowerCase();
      if (namaTersimpan && namaTersimpan !== siswa.nama.trim().toLowerCase()) {
        const err = new Error('Kelas dan nomor absen sudah dipakai nama lain');
        err.kode = 'nama-beda';
        throw err;
      }
      return 'lama';
    }

    const waktu = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(Object.assign({
      nama: siswa.nama, kelas: siswa.kelas, absen: siswa.absen,
      dibuat: waktu, diperbaruiPada: waktu
    }, Sesi.progresBaru()));
    return 'baru';
  },

  /* ---------- Baca progres ---------- */
  muatProgres: async function (siswa) {
    await Sesi.siapkan();
    const snap = await Sesi.refSiswa(siswa).get();
    const data = snap.exists ? snap.data() : {};
    return {
      levelTerbuka: data.levelTerbuka || 1,
      levelLulus: data.levelLulus || [],
      terbaik: data.terbaik || {},
      jumlahLatihan: data.jumlahLatihan || 0,
      poinMingguan: data.kunciMinggu === Sesi.kunciMingguIni() ? (data.poinMingguan || 0) : 0,
      kunciMinggu: data.kunciMinggu || '',
      poinTotal: data.poinTotal || 0
    };
  },

  /* ---------- Simpan satu sesi latihan ---------- */
  // progres  : progres yang sudah diperbarui (level terbuka, lulus, terbaik)
  // catatan  : ringkasan sesi untuk koleksi riwayat
  simpanLatihan: async function (siswa, progres, catatan) {
    await Sesi.siapkan();
    const ref = Sesi.refSiswa(siswa);
    const waktu = firebase.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    batch.set(ref, {
      nama: siswa.nama, kelas: siswa.kelas, absen: siswa.absen,
      levelTerbuka: progres.levelTerbuka,
      levelLulus: progres.levelLulus,
      terbaik: progres.terbaik,
      jumlahLatihan: progres.jumlahLatihan,
      poinMingguan: progres.poinMingguan,
      kunciMinggu: progres.kunciMinggu,
      poinTotal: progres.poinTotal,
      diperbaruiPada: waktu
    }, { merge: true });

    batch.set(ref.collection('riwayat').doc(), Object.assign({}, catatan, { waktu: waktu }));

    await batch.commit();
  },

  /* ---------- Papan peringkat: semua siswa satu kelas ---------- */
  // Satu kelas hanya sekitar 36 dokumen, jadi diurutkan di browser
  // (tidak perlu membuat composite index di Firestore).
  muatPeringkat: async function (kelas) {
    await Sesi.siapkan();
    const minggu = Sesi.kunciMingguIni();
    const snap = await db.collection('siswa').where('kelas', '==', kelas).get();
    const daftar = [];
    snap.forEach(function (doc) {
      const d = doc.data();
      daftar.push({
        id: doc.id,
        nama: d.nama || '',
        absen: d.absen,
        poin: d.kunciMinggu === minggu ? (d.poinMingguan || 0) : 0,
        levelLulus: (d.levelLulus || []).length,
        jumlahLatihan: d.jumlahLatihan || 0
      });
    });
    // Urutan: poin terbanyak, lalu level lulus terbanyak, lalu nama
    daftar.sort(function (a, b) {
      return (b.poin - a.poin) || (b.levelLulus - a.levelLulus) || a.nama.localeCompare(b.nama);
    });
    return daftar;
  }
};
