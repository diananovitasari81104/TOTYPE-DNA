/* =========================================================
   TOTYPE – koneksi ke Firebase
   Konfigurasi ini bukan rahasia (memang dipasang di kode web).
   Keamanan data diatur lewat Firestore Rules di Firebase Console.
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyArSUKDUCYyoF5TTPoWGatlCJfTUc-8v2U",
  authDomain: "totype-20005.firebaseapp.com",
  projectId: "totype-20005",
  storageBucket: "totype-20005.firebasestorage.app",
  messagingSenderId: "433586363269",
  appId: "1:433586363269:web:a8efac579d8403c2b042ec"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
