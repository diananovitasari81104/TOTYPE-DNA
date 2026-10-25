/* =========================================================
   TOTYPE – jari dan baris untuk tiap tuts (teknik 10 jari)
   Dipakai halaman Latihan dan Hasil.
   ========================================================= */
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

// 'kiri-tengah' → 'Jari Tengah Kiri'
function namaJari(id) {
  if (!id) return '';
  if (id === 'jempol') return 'Ibu Jari';
  const p = id.split('-');
  return NAMA_JARI[p[1]] + ' ' + (p[0] === 'kiri' ? 'Kiri' : 'Kanan');
}

// Jari untuk huruf/tanda baca apa pun ('K', 'k', 'Spasi')
function jariUntuk(huruf) {
  if (huruf === 'Spasi' || huruf === ' ') return 'jempol';
  return JARI[huruf.toLowerCase()];
}

// Baris keyboard tempat huruf berada
function barisUntuk(huruf) {
  const h = huruf.toLowerCase();
  if (huruf === 'Spasi' || h === ' ') return 'Tuts spasi';
  if ('asdfghjkl;\''.indexOf(h) !== -1) return 'Baris Tengah (Home Row)';
  if ('qwertyuiop[]\\'.indexOf(h) !== -1) return 'Baris Atas (Top Row)';
  if ('zxcvbnm,./'.indexOf(h) !== -1) return 'Baris Bawah (Bottom Row)';
  return 'Baris Angka';
}