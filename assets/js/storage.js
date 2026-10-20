/**
 * Storage & Engine Manager untuk Simulasi TKA (Pusmendik Clone)
 * Mengelola Bank Soal (localStorage + Import/Export JSON) dan Sesi Ujian Peserta.
 */

const TKA_DB_KEY = "tka_custom_db_v1";
const TKA_SESSION_KEY = "tka_active_session_v1";

window.TKAStorage = {
  /**
   * Ambil seluruh database soal & pengaturan
   */
  getDB: function () {
    try {
      const raw = localStorage.getItem(TKA_DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.subjects)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Gagal membaca localStorage TKA DB:", e);
    }
    // Gunakan default data dan simpan
    const clone = JSON.parse(JSON.stringify(window.TKA_DEFAULT_DATA));
    this.saveDB(clone);
    return clone;
  },

  /**
   * Simpan seluruh database ke localStorage
   */
  saveDB: function (db) {
    try {
      localStorage.setItem(TKA_DB_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error("Gagal menyimpan TKA DB:", e);
      alert("Ukuran data terlalu besar untuk penyimpanan browser (kemungkinan gambar terlalu besar). Gunakan gambar berukuran lebih kecil.");
      return false;
    }
  },

  /**
   * Reset database kembali ke bawaan pabrik
   */
  resetDB: function () {
    const clone = JSON.parse(JSON.stringify(window.TKA_DEFAULT_DATA));
    this.saveDB(clone);
    return clone;
  },

  /**
   * Ambil daftar mata pelajaran berdasarkan jenjang dan jenis_mapel
   */
  getMapelByJenjang: function (jenjang, jenis_mapel) {
    const db = this.getDB();
    return db.subjects.filter(function (s) {
      return s.jenjang === jenjang && String(s.jenis_mapel) === String(jenis_mapel);
    });
  },

  /**
   * Cari 1 paket mata pelajaran berdasarkan ID
   */
  getSubjectById: function (id) {
    const db = this.getDB();
    return db.subjects.find(function (s) {
      return String(s.id) === String(id);
    }) || null;
  },

  /**
   * Buat token acak 6 huruf kapital seperti di Pusmendik
   */
  generateToken: function () {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  /**
   * Ambil sesi simulasi aktif
   */
  getSession: function () {
    try {
      const raw = sessionStorage.getItem(TKA_SESSION_KEY) || localStorage.getItem(TKA_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Gagal membaca sesi:", e);
    }
    return null;
  },

  /**
   * Simpan sesi simulasi aktif
   */
  saveSession: function (sess) {
    const data = JSON.stringify(sess);
    try {
      sessionStorage.setItem(TKA_SESSION_KEY, data);
    } catch (e) {}
    try {
      localStorage.setItem(TKA_SESSION_KEY, data);
    } catch (e) {}
  },

  /**
   * Buat sesi baru saat peserta memilih mata pelajaran di halaman awal
   */
  initSession: function (jenjang, jenis_mapel, subjectId) {
    const db = this.getDB();
    const subj = this.getSubjectById(subjectId);
    const labelMapel = subj
      ? (subj.paket && subj.paket.trim() !== "" ? subj.mapel + " (" + subj.paket + ")" : subj.mapel)
      : "Matematika (Paket 1)";

    const sess = {
      ses_id: "loc_" + Date.now(),
      step: "login",
      jenjang: jenjang,
      jenis_mapel: jenis_mapel,
      subjectId: subjectId,
      namaMapel: labelMapel,
      durasiMenit: subj && subj.durasi_menit ? Number(subj.durasi_menit) : (db.settings.defaultDurasiMenit || 75),
      username: db.settings.defaultUsername || "P130100230",
      password: db.settings.defaultPassword || "DHND*",
      kodeNik: db.settings.defaultUsername || "P130100230",
      akunPeserta: db.settings.defaultNamaPeserta || "P130100230 - PESERTA TKA",
      namaPesertaInput: "",
      jenisKelamin: "L",
      tglLahir: "",
      bulanLahir: "",
      tahunLahir: "",
      token: this.generateToken(),
      waktuMulai: "",
      remainingSeconds: ((subj && subj.durasi_menit ? Number(subj.durasi_menit) : 75) * 60),
      answers: {}, // { [nomor]: value }
      ragu: {},    // { [nomor]: true/false }
      finished: false
    };
    this.saveSession(sess);
    return sess;
  },

  /**
   * Evaluasi / hitung skor untuk satu soal
   */
  evaluateQuestion: function (q, userAns) {
    if (!q) return { isAnswered: false, isCorrect: false, score: 0, maxScore: 1 };

    if (q.type === "pg") {
      const u = (userAns || "").toString().trim().toUpperCase();
      const k = (q.answer || "").toString().trim().toUpperCase();
      const isAnswered = u !== "";
      const isCorrect = isAnswered && u === k;
      return { isAnswered: isAnswered, isCorrect: isCorrect, score: isCorrect ? 1 : 0, maxScore: 1 };
    }

    if (q.type === "mcma") {
      // userAns berupa string "A;D" atau array ["A","D"]
      let uArr = [];
      if (Array.isArray(userAns)) {
        uArr = userAns.map(x => String(x).trim().toUpperCase()).filter(Boolean);
      } else if (typeof userAns === "string" && userAns.trim() !== "") {
        uArr = userAns.split(";").map(x => x.trim().toUpperCase()).filter(Boolean);
      }
      let kArr = [];
      if (Array.isArray(q.answer)) {
        kArr = q.answer.map(x => String(x).trim().toUpperCase()).filter(Boolean);
      } else if (typeof q.answer === "string" && q.answer.trim() !== "") {
        kArr = q.answer.split(";").map(x => x.trim().toUpperCase()).filter(Boolean);
      }
      uArr.sort();
      kArr.sort();
      const isAnswered = uArr.length > 0;
      const isCorrect = isAnswered && uArr.length === kArr.length && uArr.every((v, idx) => v === kArr[idx]);
      return { isAnswered: isAnswered, isCorrect: isCorrect, score: isCorrect ? 1 : 0, maxScore: 1 };
    }

    if (q.type === "kategori") {
      // userAns berupa string "A|1;B|2;C|1"
      const statements = q.statements || [];
      if (statements.length === 0) return { isAnswered: false, isCorrect: false, score: 0, maxScore: 1 };
      const mapUser = {};
      if (typeof userAns === "string" && userAns.trim() !== "") {
        userAns.split(";").forEach(function (pair) {
          const parts = pair.split("|");
          if (parts.length === 2) {
            mapUser[parts[0].trim().toUpperCase()] = parts[1].trim();
          }
        });
      }
      const isAnswered = Object.keys(mapUser).length > 0;
      let allMatch = isAnswered && statements.length > 0;
      statements.forEach(function (st, idx) {
        const key = (st.key || String.fromCharCode(65 + idx)).toUpperCase();
        if (String(mapUser[key] || "") !== String(st.answer || "1")) {
          allMatch = false;
        }
      });
      return { isAnswered: isAnswered, isCorrect: allMatch, score: allMatch ? 1 : 0, maxScore: 1 };
    }

    if (q.type === "isian") {
      const u = (userAns || "").toString().trim();
      const k = (q.answer || "").toString().trim();
      const isAnswered = u !== "";
      const isCorrect = isAnswered && u.toLowerCase() === k.toLowerCase();
      return { isAnswered: isAnswered, isCorrect: isCorrect, score: isCorrect ? 1 : 0, maxScore: 1 };
    }

    return { isAnswered: false, isCorrect: false, score: 0, maxScore: 1 };
  }
};
