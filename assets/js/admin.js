/**
 * Logika Halaman Admin & Editor Soal Simulasi TKA (admin.html)
 * Memungkinkan pengguna menambah/mengubah/menghapus mata pelajaran, soal, gambar,
 * kunci jawaban, pembahasan, serta ekspor/impor database JSON.
 */

let activeSubjectId = null;
let tempEditorState = {
  options: [],
  pgAnswer: "A",
  mcmaAnswers: ["A"],
  statements: [],
  isianAnswer: ""
};

$(document).ready(function () {
  const db = window.TKAStorage.getDB();

  // Cek apakah ada parameter ?subject= di URL
  const params = new URLSearchParams(window.location.search);
  const requestedSubj = params.get("subject");
  if (requestedSubj && db.subjects.some(s => String(s.id) === String(requestedSubj))) {
    activeSubjectId = requestedSubj;
  } else if (db.subjects.length > 0) {
    activeSubjectId = db.subjects[0].id;
  }

  renderSubjectList();
  renderActiveSubjectDetail();
  initSettingsModal();

  // Update label radio kategori saat input label kolom berubah
  $("#catLabel1, #catLabel2").on("input", function () {
    const l1 = $("#catLabel1").val() || "Benar";
    const l2 = $("#catLabel2").val() || "Salah";
    $(".cat-col1-label").text(l1);
    $(".cat-col2-label").text(l2);
  });
});

function getJenjangLabel(j) {
  if (j === "sma") return "SMA/MA/SMK";
  if (j === "smp") return "SMP/MTs";
  if (j === "sd") return "SD/MI";
  return (j || "").toUpperCase();
}

function getJenisLabel(jm) {
  return String(jm) === "1" ? "Wajib" : "Pilihan";
}

function getTypeBadge(type) {
  if (type === "pg") return `<span class="badge badge-primary">Pilihan Ganda (PG)</span>`;
  if (type === "mcma") return `<span class="badge badge-info">PG Kompleks (MCMA / Checkbox)</span>`;
  if (type === "kategori") return `<span class="badge badge-warning text-dark">PG Kompleks Kategori (Tabel)</span>`;
  if (type === "isian") return `<span class="badge badge-secondary">Isian Singkat</span>`;
  return `<span class="badge badge-dark">${type}</span>`;
}

function formatKeySummary(q) {
  if (q.type === "pg") {
    return `<span class="badge badge-success px-2 py-1">Kunci: ${q.answer || "-"}</span>`;
  }
  if (q.type === "mcma") {
    const arr = Array.isArray(q.answer) ? q.answer : String(q.answer || "").split(";").filter(Boolean);
    return `<span class="badge badge-success px-2 py-1">Kunci: ${arr.join(", ") || "-"}</span>`;
  }
  if (q.type === "kategori") {
    const labels = q.categoryLabels && q.categoryLabels.length >= 2 ? q.categoryLabels : ["Benar", "Salah"];
    const parts = (q.statements || []).map((st, idx) => {
      const k = st.key || String.fromCharCode(65 + idx);
      const ansLbl = String(st.answer) === "1" ? labels[0] : labels[1];
      return `${k}=${ansLbl}`;
    });
    return `<span class="badge badge-success px-2 py-1">Kunci: ${parts.join(", ") || "-"}</span>`;
  }
  if (q.type === "isian") {
    return `<span class="badge badge-success px-2 py-1">Kunci: ${q.answer || "-"}</span>`;
  }
  return "";
}

/* ==================== DAFTAR MATA PELAJARAN (SIDEBAR KIRI) ==================== */

function renderSubjectList() {
  const db = window.TKAStorage.getDB();
  const fJenjang = $("#filterJenjang").val() || "all";
  const fJenis = $("#filterJenis").val() || "all";

  const filtered = db.subjects.filter(function (s) {
    if (fJenjang !== "all" && s.jenjang !== fJenjang) return false;
    if (fJenis !== "all" && String(s.jenis_mapel) !== String(fJenis)) return false;
    return true;
  });

  const $container = $("#subjectListContainer").empty();
  if (filtered.length === 0) {
    $container.html(`<div class="text-center text-muted py-4 small">Tidak ada paket mata pelajaran pada filter ini.</div>`);
    return;
  }

  filtered.forEach(function (s) {
    const isActive = String(s.id) === String(activeSubjectId);
    const qCount = (s.questions || []).length;
    const title = s.paket && s.paket.trim() !== "" ? `${s.mapel} (${s.paket})` : s.mapel;
    const html = `
      <div class="subject-item ${isActive ? "active" : ""}" onclick="selectAdminSubject('${s.id}')">
        <div class="d-flex justify-content-between align-items-center">
          <div class="font-weight-bold" style="font-size:14px;">${escapeHtml(title)}</div>
          <span class="badge badge-light">${qCount} Soal</span>
        </div>
        <div class="text-muted small mt-1" style="font-size:11px;">
          ${getJenjangLabel(s.jenjang)} &bull; Mapel ${getJenisLabel(s.jenis_mapel)} &bull; ${s.durasi_menit || 75} Menit
        </div>
      </div>
    `;
    $container.append(html);
  });
}

function selectAdminSubject(id) {
  activeSubjectId = id;
  renderSubjectList();
  renderActiveSubjectDetail();
}

function renderActiveSubjectDetail() {
  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));

  if (!subj) {
    $("#activeSubjBadge").text("-");
    $("#activeSubjTitle").text("Pilih Paket Mata Pelajaran");
    $("#activeSubjMeta").text("Silakan pilih atau tambah paket mata pelajaran di sebelah kiri.");
    $("#adminQuestionsList").html(`<div class="alert alert-info">Belum ada paket mata pelajaran yang dipilih.</div>`);
    return;
  }

  const title = subj.paket && subj.paket.trim() !== "" ? `${subj.mapel} (${subj.paket})` : subj.mapel;
  const qCount = (subj.questions || []).length;

  $("#activeSubjBadge").text(`${getJenjangLabel(subj.jenjang)} - Mapel ${getJenisLabel(subj.jenis_mapel)}`);
  $("#activeSubjTitle").text(title);
  $("#activeSubjMeta").text(`Alokasi Waktu: ${subj.durasi_menit || 75} Menit | Total: ${qCount} Butir Soal`);

  renderAdminQuestions(subj);
}

/* ==================== CRUD PAKET MATA PELAJARAN ==================== */

function openAddSubjectModal() {
  $("#editSubjectMode").val("add");
  $("#modalSubjectTitle").text("Tambah Paket Mata Pelajaran Baru");
  $("#subjJenjang").val("sma");
  $("#subjJenis").val("1");
  $("#subjNama").val("");
  $("#subjPaket").val("Paket 1");
  $("#subjDurasi").val(75);
  $("#modalSubject").modal("show");
}

function openEditSubjectModal() {
  const subj = window.TKAStorage.getSubjectById(activeSubjectId);
  if (!subj) return;

  $("#editSubjectMode").val("edit");
  $("#modalSubjectTitle").text("Edit Info Paket Mata Pelajaran");
  $("#subjJenjang").val(subj.jenjang || "sma");
  $("#subjJenis").val(String(subj.jenis_mapel || "1"));
  $("#subjNama").val(subj.mapel || "");
  $("#subjPaket").val(subj.paket || "");
  $("#subjDurasi").val(subj.durasi_menit || 75);
  $("#modalSubject").modal("show");
}

function saveSubjectFromModal() {
  const mode = $("#editSubjectMode").val();
  const jenjang = $("#subjJenjang").val();
  const jenis = $("#subjJenis").val();
  const nama = ($("#subjNama").val() || "").trim();
  const paket = ($("#subjPaket").val() || "").trim();
  const durasi = parseInt($("#subjDurasi").val(), 10) || 75;

  if (!nama) {
    alert("Nama Mata Pelajaran wajib diisi!");
    return;
  }

  const db = window.TKAStorage.getDB();

  if (mode === "add") {
    const newId = jenjang + "_" + Date.now();
    db.subjects.push({
      id: newId,
      jenjang: jenjang,
      jenis_mapel: String(jenis),
      mapel: nama,
      paket: paket,
      durasi_menit: durasi,
      questions: []
    });
    activeSubjectId = newId;
  } else {
    const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
    if (subj) {
      subj.jenjang = jenjang;
      subj.jenis_mapel = String(jenis);
      subj.mapel = nama;
      subj.paket = paket;
      subj.durasi_menit = durasi;
    }
  }

  window.TKAStorage.saveDB(db);
  $("#modalSubject").modal("hide");
  renderSubjectList();
  renderActiveSubjectDetail();
}

function deleteActiveSubject() {
  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
  if (!subj) return;

  if (!confirm(`Apakah Anda yakin ingin menghapus paket mata pelajaran "${subj.mapel}" beserta seluruh soalnya?`)) {
    return;
  }

  db.subjects = db.subjects.filter(s => String(s.id) !== String(activeSubjectId));
  activeSubjectId = db.subjects.length > 0 ? db.subjects[0].id : null;
  window.TKAStorage.saveDB(db);
  renderSubjectList();
  renderActiveSubjectDetail();
}

/* ==================== DAFTAR & CRUD SOAL ==================== */

function renderAdminQuestions(subj) {
  const $list = $("#adminQuestionsList").empty();
  const questions = subj.questions || [];

  if (questions.length === 0) {
    $list.html(`
      <div class="text-center py-5 border rounded bg-light">
        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
        <h6 class="font-weight-bold">Belum Ada Soal di Paket Ini</h6>
        <p class="text-muted small mb-3">Klik tombol <b>"+ Tambah Soal Baru"</b> di kanan atas untuk mulai membuat soal pilihan ganda, MCMA, kategori, atau isian.</p>
        <button class="btn btn-primary btn-sm font-weight-bold" onclick="openQuestionModal(-1)">
          <i class="fas fa-plus-circle mr-1"></i>Tambah Soal Pertama
        </button>
      </div>
    `);
    return;
  }

  questions.forEach(function (q, idx) {
    const stimClean = q.stimulus && q.stimulus.replace(/<[^>]*>/g, "").trim() !== ""
      ? `<div class="mb-1"><span class="badge badge-light border mr-1">Wacana:</span> ${q.stimulus}</div>`
      : (q.stimulus && q.stimulus.indexOf("<img") !== -1 ? `<div class="mb-1"><span class="badge badge-light border mr-1">Wacana Gambar:</span> ${q.stimulus}</div>` : "");

    const html = `
      <div class="question-card">
        <div class="d-flex justify-content-between align-items-center flex-wrap mb-2">
          <div class="d-flex align-items-center flex-wrap" style="gap:8px;">
            <span class="badge badge-dark px-2 py-1" style="font-size:13px;">No. ${idx + 1}</span>
            ${getTypeBadge(q.type)}
            ${formatKeySummary(q)}
          </div>
          <div class="btn-group btn-group-sm mt-2 mt-sm-0">
            <button class="btn btn-outline-secondary" title="Geser Naik" onclick="moveQuestion(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
              <i class="fas fa-arrow-up"></i>
            </button>
            <button class="btn btn-outline-secondary" title="Geser Turun" onclick="moveQuestion(${idx}, 1)" ${idx === questions.length - 1 ? "disabled" : ""}>
              <i class="fas fa-arrow-down"></i>
            </button>
            <button class="btn btn-outline-info" title="Duplikat Soal" onclick="duplicateQuestion(${idx})">
              <i class="fas fa-copy mr-1"></i>Duplikat
            </button>
            <button class="btn btn-primary font-weight-bold" onclick="openQuestionModal(${idx})">
              <i class="fas fa-edit mr-1"></i>Edit Soal
            </button>
            <button class="btn btn-outline-danger" title="Hapus Soal" onclick="deleteQuestion(${idx})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="q-preview-box">
          ${stimClean}
          <div><strong>Pertanyaan:</strong> ${q.question || "<em>(Kosong)</em>"}</div>
        </div>
      </div>
    `;
    $list.append(html);
  });
}

function openQuestionModal(idx) {
  const subj = window.TKAStorage.getSubjectById(activeSubjectId);
  if (!subj) {
    alert("Pilih paket mata pelajaran terlebih dahulu!");
    return;
  }

  $("#editQuestionIndex").val(idx);

  if (idx === -1) {
    $("#modalQuestionTitle").text(`Tambah Soal Baru (No. ${(subj.questions || []).length + 1})`);
    $("#qType").val("pg");
    $("#catLabel1").val("Benar");
    $("#catLabel2").val("Salah");
    $("#qStimulus").val("");
    $("#qStem").val("");
    $("#qPembahasan").val("");

    tempEditorState = {
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
        { key: "E", text: "" }
      ],
      pgAnswer: "A",
      mcmaAnswers: ["A"],
      statements: [
        { key: "A", text: "", answer: "1" },
        { key: "B", text: "", answer: "2" },
        { key: "C", text: "", answer: "1" }
      ],
      isianAnswer: ""
    };
  } else {
    const q = subj.questions[idx];
    $("#modalQuestionTitle").text(`Edit Soal Nomor ${idx + 1}`);
    $("#qType").val(q.type || "pg");
    const catLabels = q.categoryLabels && q.categoryLabels.length >= 2 ? q.categoryLabels : ["Benar", "Salah"];
    $("#catLabel1").val(catLabels[0]);
    $("#catLabel2").val(catLabels[1]);
    $("#qStimulus").val(q.stimulus || "");
    $("#qStem").val(q.question || "");
    $("#qPembahasan").val(q.pembahasan || "");

    const clonedOpts = (q.options && q.options.length > 0)
      ? JSON.parse(JSON.stringify(q.options))
      : [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
          { key: "E", text: "" }
        ];

    let mcmaArr = ["A"];
    if (Array.isArray(q.answer)) {
      mcmaArr = q.answer.slice();
    } else if (typeof q.answer === "string" && q.answer.trim() !== "") {
      mcmaArr = q.answer.split(";").map(s => s.trim().toUpperCase()).filter(Boolean);
    }

    const clonedStmts = (q.statements && q.statements.length > 0)
      ? JSON.parse(JSON.stringify(q.statements))
      : [
          { key: "A", text: "", answer: "1" },
          { key: "B", text: "", answer: "2" },
          { key: "C", text: "", answer: "1" }
        ];

    tempEditorState = {
      options: clonedOpts,
      pgAnswer: typeof q.answer === "string" && q.answer.length === 1 ? q.answer.toUpperCase() : "A",
      mcmaAnswers: mcmaArr,
      statements: clonedStmts,
      isianAnswer: typeof q.answer === "string" ? q.answer : ""
    };
  }

  onQuestionTypeChange();
  $("#modalQuestion").modal("show");
}

function syncCurrentDynamicInputsToState() {
  const type = $("#qType").val();
  if ($("#dynamicOptionsEditor").children().length === 0) return;

  if (type === "pg" || type === "mcma") {
    const newOpts = [];
    $(".opt-row-item").each(function (idx) {
      const key = String.fromCharCode(65 + idx);
      const text = $(this).find(".opt-text-input").val() || "";
      newOpts.push({ key: key, text: text });
    });
    if (newOpts.length > 0) tempEditorState.options = newOpts;

    if (type === "pg") {
      const checked = $("input[name='pgCorrectKey']:checked").val();
      if (checked) tempEditorState.pgAnswer = checked;
    } else {
      const checkedArr = [];
      $("input[name='mcmaCorrectKey']:checked").each(function () {
        checkedArr.push($(this).val());
      });
      tempEditorState.mcmaAnswers = checkedArr;
    }
  } else if (type === "kategori") {
    const newStmts = [];
    $(".stmt-row-item").each(function (idx) {
      const key = String.fromCharCode(65 + idx);
      const text = $(this).find(".stmt-text-input").val() || "";
      const ans = $(this).find(`input[name='stmtKey_${idx}']:checked`).val() || "1";
      newStmts.push({ key: key, text: text, answer: String(ans) });
    });
    if (newStmts.length > 0) tempEditorState.statements = newStmts;
  } else if (type === "isian") {
    const v = $("#isianKeyInput").val();
    if (v !== undefined) tempEditorState.isianAnswer = v;
  }
}

function onQuestionTypeChange() {
  const type = $("#qType").val();
  if (type === "kategori") {
    $("#categoryLabelsGroup").removeClass("d-none");
  } else {
    $("#categoryLabelsGroup").addClass("d-none");
  }
  renderDynamicOptionsEditor(type);
}

function renderDynamicOptionsEditor(type) {
  const $editor = $("#dynamicOptionsEditor").empty();

  if (type === "pg" || type === "mcma") {
    const isPG = type === "pg";
    const title = isPG
      ? "Pilihan Jawaban & Kunci Jawaban (Pilih 1 Radio Kunci Jawaban Benar):"
      : "Pilihan Pernyataan & Kunci Jawaban (Centang Semua Jawaban Benar):";

    let rowsHtml = "";
    tempEditorState.options.forEach(function (opt, idx) {
      const key = String.fromCharCode(65 + idx);
      opt.key = key;
      const isChecked = isPG
        ? (tempEditorState.pgAnswer === key)
        : (tempEditorState.mcmaAnswers.indexOf(key) !== -1);

      const selectorInput = isPG
        ? `<input type="radio" name="pgCorrectKey" value="${key}" ${isChecked ? "checked" : ""} onchange="tempEditorState.pgAnswer='${key}'"> <strong class="ml-1">Kunci ${key}</strong>`
        : `<input type="checkbox" name="mcmaCorrectKey" value="${key}" ${isChecked ? "checked" : ""}> <strong class="ml-1">Benar (${key})</strong>`;

      rowsHtml += `
        <div class="form-row align-items-center mb-2 opt-row-item" data-idx="${idx}">
          <div class="col-md-2 col-3">
            <label class="btn btn-outline-success btn-sm btn-block mb-0 d-flex align-items-center justify-content-center" style="cursor:pointer;">
              ${selectorInput}
            </label>
          </div>
          <div class="col-md-8 col-7">
            <input type="text" class="form-control form-control-sm opt-text-input" id="optInput_${idx}" value="${escapeAttr(opt.text)}" placeholder="Teks atau HTML opsi ${key}...">
          </div>
          <div class="col-md-2 col-2 d-flex" style="gap:4px;">
            <label class="btn btn-outline-info btn-sm mb-0" title="Sisipkan Gambar ke Opsi ${key}" style="cursor:pointer;">
              <i class="fas fa-image"></i>
              <input type="file" accept="image/*" style="display:none" onchange="insertImageToOption(this, ${idx})">
            </label>
            <button type="button" class="btn btn-outline-danger btn-sm" title="Hapus Opsi" onclick="removeOptionRow(${idx})" ${tempEditorState.options.length <= 2 ? "disabled" : ""}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    });

    $editor.html(`
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="font-weight-bold small mb-0">${title}</label>
        <button type="button" class="btn btn-outline-primary btn-sm" onclick="addOptionRow()">
          <i class="fas fa-plus mr-1"></i>Tambah Opsi Jawaban
        </button>
      </div>
      ${rowsHtml}
    `);
    return;
  }

  if (type === "kategori") {
    const l1 = $("#catLabel1").val() || "Benar";
    const l2 = $("#catLabel2").val() || "Salah";

    let rowsHtml = "";
    tempEditorState.statements.forEach(function (st, idx) {
      const key = String.fromCharCode(65 + idx);
      st.key = key;
      const ans = String(st.answer || "1");

      rowsHtml += `
        <div class="form-row align-items-center mb-2 stmt-row-item" data-idx="${idx}">
          <div class="col-md-1 col-2 text-center">
            <span class="badge badge-secondary px-2 py-2">Pernyataan ${key}</span>
          </div>
          <div class="col-md-7 col-10 mb-1 mb-md-0">
            <input type="text" class="form-control form-control-sm stmt-text-input" value="${escapeAttr(st.text)}" placeholder="Tulis kalimat pernyataan ${key}...">
          </div>
          <div class="col-md-3 col-9 d-flex align-items-center justify-content-around border rounded py-1 bg-light">
            <label class="mb-0 small font-weight-bold" style="cursor:pointer;">
              <input type="radio" name="stmtKey_${idx}" value="1" ${ans === "1" ? "checked" : ""}>
              <span class="cat-col1-label">${escapeHtml(l1)}</span>
            </label>
            <label class="mb-0 small font-weight-bold" style="cursor:pointer;">
              <input type="radio" name="stmtKey_${idx}" value="2" ${ans === "2" ? "checked" : ""}>
              <span class="cat-col2-label">${escapeHtml(l2)}</span>
            </label>
          </div>
          <div class="col-md-1 col-3 text-right">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeStatementRow(${idx})" ${tempEditorState.statements.length <= 1 ? "disabled" : ""}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    });

    $editor.html(`
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="font-weight-bold small mb-0">Daftar Pernyataan & Kunci Kategori (${escapeHtml(l1)} / ${escapeHtml(l2)}):</label>
        <button type="button" class="btn btn-outline-primary btn-sm" onclick="addStatementRow()">
          <i class="fas fa-plus mr-1"></i>Tambah Baris Pernyataan
        </button>
      </div>
      ${rowsHtml}
    `);
    return;
  }

  if (type === "isian") {
    $editor.html(`
      <div class="form-group mb-0">
        <label class="font-weight-bold small">Kunci Jawaban Singkat (Huruf besar/kecil diabaikan saat pencocokan):</label>
        <input type="text" class="form-control" id="isianKeyInput" value="${escapeAttr(tempEditorState.isianAnswer)}" placeholder="Contoh: 15 atau Soekarno">
      </div>
    `);
  }
}

function addOptionRow() {
  syncCurrentDynamicInputsToState();
  const nextKey = String.fromCharCode(65 + tempEditorState.options.length);
  tempEditorState.options.push({ key: nextKey, text: "" });
  renderDynamicOptionsEditor($("#qType").val());
}

function removeOptionRow(idx) {
  syncCurrentDynamicInputsToState();
  if (tempEditorState.options.length <= 2) return;
  tempEditorState.options.splice(idx, 1);
  tempEditorState.options.forEach((o, i) => {
    o.key = String.fromCharCode(65 + i);
  });
  renderDynamicOptionsEditor($("#qType").val());
}

function addStatementRow() {
  syncCurrentDynamicInputsToState();
  const nextKey = String.fromCharCode(65 + tempEditorState.statements.length);
  tempEditorState.statements.push({ key: nextKey, text: "", answer: "1" });
  renderDynamicOptionsEditor("kategori");
}

function removeStatementRow(idx) {
  syncCurrentDynamicInputsToState();
  if (tempEditorState.statements.length <= 1) return;
  tempEditorState.statements.splice(idx, 1);
  tempEditorState.statements.forEach((s, i) => {
    s.key = String.fromCharCode(65 + i);
  });
  renderDynamicOptionsEditor("kategori");
}

/* ==================== TOOLBAR HTML & UPLOAD GAMBAR BASE64 ==================== */

function insertTag(textareaId, openTag, closeTag) {
  const el = document.getElementById(textareaId);
  if (!el) return;
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const text = el.value;
  const selected = text.substring(start, end) || "teks";
  el.value = text.substring(0, start) + openTag + selected + closeTag + text.substring(end);
  el.focus();
}

function insertImageToTextarea(inputEl, textareaId) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgTag = `\n<p><img src="${e.target.result}" alt="Gambar Soal" style="max-width:100%; height:auto;"></p>\n`;
    const $ta = $("#" + textareaId);
    $ta.val(($ta.val() || "") + imgTag);
    inputEl.value = "";
  };
  reader.readAsDataURL(file);
}

function insertImageToOption(inputEl, optIdx) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgTag = `<img src="${e.target.result}" alt="Opsi" style="max-height:100px; width:auto;">`;
    const $inp = $("#optInput_" + optIdx);
    $inp.val(($inp.val() || "") + " " + imgTag);
    inputEl.value = "";
  };
  reader.readAsDataURL(file);
}

/* ==================== SIMPAN, GESER, DUPLIKAT, HAPUS SOAL ==================== */

function saveQuestionFromModal() {
  syncCurrentDynamicInputsToState();

  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
  if (!subj) return;

  const idx = parseInt($("#editQuestionIndex").val(), 10);
  const type = $("#qType").val();
  const stimulus = ($("#qStimulus").val() || "").trim();
  const question = ($("#qStem").val() || "").trim();
  const pembahasan = ($("#qPembahasan").val() || "").trim();

  if (!question) {
    alert("Pertanyaan soal wajib diisi!");
    return;
  }

  const qObj = {
    id: idx >= 0 && subj.questions[idx] ? subj.questions[idx].id : ("q_" + Date.now()),
    type: type,
    stimulus: stimulus,
    question: question,
    pembahasan: pembahasan
  };

  if (type === "pg") {
    qObj.options = tempEditorState.options.map((o, i) => ({
      key: String.fromCharCode(65 + i),
      text: o.text || String.fromCharCode(65 + i)
    }));
    qObj.answer = tempEditorState.pgAnswer || "A";
  } else if (type === "mcma") {
    if (tempEditorState.mcmaAnswers.length === 0) {
      alert("Pilih minimal 1 kunci jawaban yang benar untuk soal MCMA!");
      return;
    }
    qObj.options = tempEditorState.options.map((o, i) => ({
      key: String.fromCharCode(65 + i),
      text: o.text || String.fromCharCode(65 + i)
    }));
    qObj.answer = tempEditorState.mcmaAnswers;
  } else if (type === "kategori") {
    const l1 = ($("#catLabel1").val() || "Benar").trim();
    const l2 = ($("#catLabel2").val() || "Salah").trim();
    qObj.categoryLabels = [l1, l2];
    qObj.statements = tempEditorState.statements.map((s, i) => ({
      key: String.fromCharCode(65 + i),
      text: s.text || `Pernyataan ${String.fromCharCode(65 + i)}`,
      answer: String(s.answer || "1")
    }));
  } else if (type === "isian") {
    qObj.answer = (tempEditorState.isianAnswer || "").trim();
  }

  if (!Array.isArray(subj.questions)) subj.questions = [];
  if (idx === -1) {
    subj.questions.push(qObj);
  } else {
    subj.questions[idx] = qObj;
  }

  if (window.TKAStorage.saveDB(db)) {
    $("#modalQuestion").modal("hide");
    renderSubjectList();
    renderActiveSubjectDetail();
  }
}

function moveQuestion(idx, dir) {
  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
  if (!subj || !subj.questions) return;

  const target = idx + dir;
  if (target < 0 || target >= subj.questions.length) return;

  const temp = subj.questions[idx];
  subj.questions[idx] = subj.questions[target];
  subj.questions[target] = temp;

  window.TKAStorage.saveDB(db);
  renderActiveSubjectDetail();
}

function duplicateQuestion(idx) {
  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
  if (!subj || !subj.questions || !subj.questions[idx]) return;

  const copy = JSON.parse(JSON.stringify(subj.questions[idx]));
  copy.id = "q_" + Date.now();
  subj.questions.splice(idx + 1, 0, copy);

  window.TKAStorage.saveDB(db);
  renderSubjectList();
  renderActiveSubjectDetail();
}

function deleteQuestion(idx) {
  const db = window.TKAStorage.getDB();
  const subj = db.subjects.find(s => String(s.id) === String(activeSubjectId));
  if (!subj || !subj.questions || !subj.questions[idx]) return;

  if (!confirm(`Hapus Soal Nomor ${idx + 1}?`)) return;

  subj.questions.splice(idx, 1);
  window.TKAStorage.saveDB(db);
  renderSubjectList();
  renderActiveSubjectDetail();
}

/* ==================== EKSPOR, IMPOR, RESET & PENGATURAN ==================== */

function exportJSON() {
  const db = window.TKAStorage.getDB();
  const dataStr = JSON.stringify(db, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `bank-soal-tka-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSONFile(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !Array.isArray(parsed.subjects)) {
        alert("Format file JSON tidak valid! Pastikan file JSON berasal dari Ekspor Bank Soal TKA.");
        return;
      }
      window.TKAStorage.saveDB(parsed);
      activeSubjectId = parsed.subjects.length > 0 ? parsed.subjects[0].id : null;
      renderSubjectList();
      renderActiveSubjectDetail();
      initSettingsModal();
      alert("Database soal berhasil diimpor!");
    } catch (err) {
      alert("Gagal membaca file JSON: " + err.message);
    } finally {
      inputEl.value = "";
    }
  };
  reader.readAsText(file);
}

function resetToDefaultDB() {
  if (!confirm("Kembalikan seluruh mata pelajaran dan soal ke bawaan asli Pusmendik? Semua perubahan soal yang belum diekspor akan terhapus.")) {
    return;
  }
  const db = window.TKAStorage.resetDB();
  activeSubjectId = db.subjects.length > 0 ? db.subjects[0].id : null;
  renderSubjectList();
  renderActiveSubjectDetail();
  initSettingsModal();
}

function initSettingsModal() {
  const db = window.TKAStorage.getDB();
  const s = db.settings || {};
  $("#setUsername").val(s.defaultUsername || "P130100230");
  $("#setPassword").val(s.defaultPassword || "DHND*");
  $("#setNamaAkun").val(s.defaultNamaPeserta || "P130100230 - PESERTA TKA");
  $("#setShowPembahasan").prop("checked", s.allowReviewPembahasan !== false);
  $("#setShowAdminBtn").prop("checked", s.showAdminButton !== false);
}

function saveGlobalSettings() {
  const db = window.TKAStorage.getDB();
  db.settings = db.settings || {};
  db.settings.defaultUsername = ($("#setUsername").val() || "P130100230").trim();
  db.settings.defaultPassword = ($("#setPassword").val() || "DHND*").trim();
  db.settings.defaultNamaPeserta = ($("#setNamaAkun").val() || "P130100230 - PESERTA TKA").trim();
  db.settings.allowReviewPembahasan = $("#setShowPembahasan").is(":checked");
  db.settings.showAdminButton = $("#setShowAdminBtn").is(":checked");

  window.TKAStorage.saveDB(db);
  $("#modalSettings").modal("hide");
  alert("Pengaturan berhasil disimpan!");
}

/* ==================== HELPER ESCAPING ==================== */

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
