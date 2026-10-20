/**
 * Logika Utama Aplikasi Simulasi TKA - Pusmendik Kemendikdasmen (ANBK Clone)
 * Mereplikasi seluruh alur: Pilih Mapel -> Login -> Konfirmasi Data -> Konfirmasi Tes -> Proses Tes -> Finish -> Reviu Hasil
 */

var mapelData = [];
var selectedSoal = 1;
var jumlahSoal = 0;
var currentQuestions = [];
var examTimerInterval = null;

// ==================== UTILITAS NOTIFIKASI MODERN ====================
function showNotification(message, type) {
  type = type || "info";
  $(".custom-notification").remove();

  var iconClass =
    type === "error"
      ? "fa-exclamation-circle"
      : type === "success"
      ? "fa-check-circle"
      : type === "warning"
      ? "fa-exclamation-triangle"
      : "fa-info-circle";

  var bgColor =
    type === "error"
      ? "#dc3545"
      : type === "success"
      ? "#28a745"
      : type === "warning"
      ? "#ffc107"
      : "#007bff";

  var notification = $(
    '<div class="custom-notification" style="' +
      "position: fixed; top: 140px; right: 20px; background: " +
      bgColor +
      "; color: white; padding: 15px 20px; border-radius: 10px; " +
      "box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10001; display: flex; " +
      "align-items: center; max-width: 400px; opacity: 0; transform: translateX(100%); " +
      "transition: all 0.3s ease; font-family: 'Poppins', sans-serif;\">" +
      '<i class="fas ' +
      iconClass +
      ' mr-3" style="font-size: 18px;"></i>' +
      '<span style="font-weight: 500;">' +
      message +
      "</span>" +
      '<button onclick="$(this).closest(\'.custom-notification\').fadeOut(300)" style="' +
      "background: none; border: none; color: white; margin-left: 15px; cursor: pointer; font-size: 16px; opacity: 0.8;\">" +
      '<i class="fas fa-times"></i>' +
      "</button></div>"
  );

  $("body").append(notification);
  setTimeout(function () {
    notification.css({ opacity: "1", transform: "translateX(0)" });
  }, 80);

  setTimeout(function () {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 4500);
}

// ==================== MANAJEMEN TAMPILAN / ROUTER HALAMAN ====================
function switchView(viewName) {
  $(".app-view").addClass("d-none");
  $(".custom-notification").remove();

  var db = TKAStorage.getDB();
  var sess = TKAStorage.getSession();

  if (db.settings && db.settings.showAdminButton === false) {
    $("#floatingAdminBtn").hide();
  } else {
    // Sembunyikan tombol admin saat sedang mengerjakan soal agar tidak mengganggu, tampilkan di halaman awal & hasil
    if (viewName === "proses_tes") {
      $("#floatingAdminBtn").hide();
    } else {
      $("#floatingAdminBtn").show();
    }
  }

  if (viewName === "pilih_mapel") {
    $("#pageTitle").text("Ayo Coba TKA | Pilih Mata Pelajaran");
    $("#appBody").removeClass("mode-cbt").addClass("mode-landing");
    $("#bgPattern, #headerLanding, #footerInfo, #headerLandingCenter").removeClass("d-none");
    $("#headerReviewLeft, #headerReviewRight, #headerCBT").addClass("d-none");
    $("#view-pilih-mapel").removeClass("d-none");
    stopExamTimer();
  } else if (viewName === "login") {
    $("#pageTitle").text("Simulasi AKM | LOGIN");
    $("#appBody").removeClass("mode-landing").addClass("mode-cbt");
    $("#bgPattern, #headerLanding, #footerInfo, #headerCBTUserBox").addClass("d-none");
    $("#headerCBT").removeClass("d-none");
    if (sess) {
      $("#username").val(sess.username || "P130100230");
      $("#password").val(sess.password || "DHND*");
    }
    $("#view-login").removeClass("d-none");
  } else if (viewName === "konfirmasi_data") {
    $("#pageTitle").text("Simulasi TKA | Konfirmasi Data");
    $("#appBody").removeClass("mode-landing").addClass("mode-cbt");
    $("#bgPattern, #headerLanding, #footerInfo").addClass("d-none");
    $("#headerCBT, #headerCBTUserBox").removeClass("d-none");
    if (sess) {
      $("#headerCBTUserName").text(sess.akunPeserta);
      $("#token").text("Token : " + sess.token);
      $("#konf_nik").val(sess.kodeNik);
      $("#konf_akun_peserta").val(sess.akunPeserta);
      $("#konf_mata_ujian").val(sess.namaMapel);
      $("#nama_peserta").val(sess.namaPesertaInput || "");
      $("#input-token").val("");
    }
    $("#view-konfirmasi-data").removeClass("d-none");
  } else if (viewName === "konfirmasi_tes") {
    $("#pageTitle").text("Simulasi TKA | Konfirmasi Tes");
    $("#appBody").removeClass("mode-landing").addClass("mode-cbt");
    $("#bgPattern, #headerLanding, #footerInfo").addClass("d-none");
    $("#headerCBT, #headerCBTUserBox").removeClass("d-none");
    if (sess) {
      var displayUser = sess.namaPesertaInput
        ? sess.kodeNik + " - " + sess.namaPesertaInput.toUpperCase()
        : sess.akunPeserta;
      $("#headerCBTUserName").text(displayUser);
      $("#tes_nama_mapel").val(sess.namaMapel);
      var now = new Date();
      var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
      var formattedNow =
        pad2(now.getMonth() + 1) + "/" + pad2(now.getDate()) + "/" + now.getFullYear() +
        " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
      $("#tes_waktu_mulai").val(formattedNow);
      $("#tes_alokasi_waktu").val((sess.durasiMenit || 75) + " Menit");
    }
    $("#view-konfirmasi-tes").removeClass("d-none");
  } else if (viewName === "proses_tes") {
    $("#pageTitle").text("Simulasi TKA");
    $("#appBody").removeClass("mode-landing").addClass("mode-cbt");
    $("#bgPattern, #headerLanding, #footerInfo").addClass("d-none");
    $("#headerCBT, #headerCBTUserBox").removeClass("d-none");
    $("#view-proses-tes").removeClass("d-none");
    initExamView();
  } else if (viewName === "finish_tes") {
    $("#pageTitle").text("Simulasi TKA | Konfirmasi Selesai");
    $("#appBody").removeClass("mode-landing").addClass("mode-cbt");
    $("#bgPattern, #headerLanding, #footerInfo").addClass("d-none");
    $("#headerCBT, #headerCBTUserBox").removeClass("d-none");
    $("#view-finish-tes").removeClass("d-none");
  } else if (viewName === "review_hasil") {
    $("#pageTitle").text("Ayo Coba TKA | Reviu Hasil");
    $("#appBody").removeClass("mode-cbt").addClass("mode-landing");
    $("#bgPattern, #headerLanding, #footerInfo").removeClass("d-none");
    $("#headerLandingCenter, #headerCBT").addClass("d-none");
    $("#headerReviewLeft, #headerReviewRight").removeClass("d-none");
    $("#view-review-hasil").removeClass("d-none");
    stopExamTimer();
    renderReviewHasil();
  }
  window.scrollTo(0, 0);
}

// ==================== VIEW 1: DROPDOWN MATA PELAJARAN ====================
function renderMapelOptions(items) {
  var html = "";
  var selectedVal = $("#mapel").val();
  if (!items || items.length === 0) {
    html = '<div class="mapel-empty">Mata pelajaran tidak ditemukan</div>';
  } else {
    $.each(items, function (i, item) {
      var cls = String(item.id) === String(selectedVal) ? "mapel-option selected" : "mapel-option";
      var label = item.paket && item.paket.trim() !== "" ? item.mapel + " (" + item.paket + ")" : item.mapel;
      var qCount = item.questions ? item.questions.length : 0;
      html +=
        '<div class="' +
        cls +
        '" data-value="' +
        item.id +
        '" data-label="' +
        $("<div>").text(label).html() +
        '">' +
        label +
        ' <small class="text-muted ml-1">(' +
        qCount +
        " soal)</small></div>";
    });
  }
  $("#mapel_options_list").html(html);
}

function setMapelValue(val, label) {
  $("#mapel").val(val);
  if (val) {
    $("#mapel_selected_label")
      .text(label)
      .removeClass("mapel-placeholder")
      .addClass("mapel-selected-text");
  } else {
    $("#mapel_selected_label")
      .text("Pilih mata pelajaran...")
      .removeClass("mapel-selected-text")
      .addClass("mapel-placeholder");
  }
  $("#mapel_options_list .mapel-option").removeClass("selected");
  $('#mapel_options_list .mapel-option[data-value="' + val + '"]').addClass("selected");
}

function openMapelDropdown() {
  var $toggle = $("#mapel_toggle");
  var $dropdown = $("#mapel_dropdown");

  var toggleBottom = $toggle.offset().top + $toggle.outerHeight();
  var spaceBelow = $(window).height() - toggleBottom - 55;

  if (spaceBelow < 260) {
    $dropdown.addClass("up");
    $toggle.addClass("open-up");
  } else {
    $dropdown.removeClass("up");
    $toggle.removeClass("open-up");
  }

  $dropdown.show();
  $toggle.addClass("open");
  $("#mapel_arrow").addClass("rotated");
  $("#mapel_search_input").val("").focus();
  renderMapelOptions(mapelData);
}

function closeMapelDropdown() {
  $("#mapel_dropdown").hide().removeClass("up");
  $("#mapel_toggle").removeClass("open open-up");
  $("#mapel_arrow").removeClass("rotated");
}

function loadMapelByJenjang(jenjang) {
  var jenisMapel = $("#jenis_mapel").val();
  mapelData = TKAStorage.getMapelByJenjang(jenjang, jenisMapel);
  setMapelValue("", "");

  if (mapelData && mapelData.length > 0) {
    var options = "";
    $.each(mapelData, function (i, item) {
      var label = item.paket && item.paket.trim() !== "" ? item.mapel + " (" + item.paket + ")" : item.mapel;
      options += '<option value="' + item.id + '">' + label + "</option>";
    });
    $("#mapel").html(options);
    $("#mapel_toggle").removeClass("disabled");
    renderMapelOptions(mapelData);
    // Pilih otomatis opsi pertama jika diinginkan ketika diklik, biarkan placeholder tampil seperti asli
    showNotification("Mata pelajaran berhasil dimuat!", "success");
  } else {
    mapelData = [];
    $("#mapel").html('<option value="">Tidak ada mata pelajaran tersedia</option>');
    $("#mapel_options_list").html('<div class="mapel-empty">Tidak ada mata pelajaran tersedia</div>');
    $("#mapel_toggle").removeClass("disabled");
    showNotification("Tidak ada mata pelajaran tersedia untuk jenjang ini.", "warning");
  }
}

function selectData() {
  var jenjang = $("#jenjang").val();
  var jenisMapel = $("#jenis_mapel").val();
  var mapelId = $("#mapel").val();

  if (!mapelId || mapelId === "") {
    showNotification("Silakan pilih mata pelajaran terlebih dahulu!", "error");
    $("#mapel_toggle").addClass("error-input");
    setTimeout(function () {
      $("#mapel_toggle").removeClass("error-input");
    }, 3000);
    return false;
  }

  var subj = TKAStorage.getSubjectById(mapelId);
  if (subj && (!subj.questions || subj.questions.length === 0)) {
    showNotification(
      "Paket mata pelajaran ini belum memiliki soal. Silakan tambahkan soal melalui tombol 'Kelola / Edit Soal' di kanan bawah!",
      "warning"
    );
    return false;
  }

  $("#loader").fadeIn(200);
  showNotification("Berhasil! Mengarahkan ke halaman simulasi...", "success");

  setTimeout(function () {
    $("#loader").fadeOut(200);
    TKAStorage.initSession(jenjang, jenisMapel, mapelId);
    switchView("login");
  }, 600);
}

// ==================== VIEW 2: LOGIN ====================
function showPassword() {
  var type = $("#password").attr("type");
  if (type === "password") {
    $("#btn-eye").css("color", "#00ff00");
    $("#password").attr("type", "text");
  } else {
    $("#btn-eye").css("color", "#636e72");
    $("#password").attr("type", "password");
  }
}

function login() {
  var username = $("#username").val().trim();
  var password = $("#password").val().trim();

  if (username === "") {
    $("#username").focus();
    return;
  }
  if (password === "") {
    $("#password").focus();
    return;
  }

  $("#loader").fadeIn(150);
  setTimeout(function () {
    $("#loader").fadeOut(150);
    var sess = TKAStorage.getSession();
    if (sess) {
      sess.username = username;
      sess.kodeNik = username;
      sess.step = "konfirmasi_data";
      TKAStorage.saveSession(sess);
    }
    switchView("konfirmasi_data");
  }, 400);
}

// ==================== VIEW 3: KONFIRMASI DATA PESERTA ====================
function refreshToken() {
  $("#token").html("Token : <i>Mengambil Token</i>");
  setTimeout(function () {
    var newToken = TKAStorage.generateToken();
    var sess = TKAStorage.getSession();
    if (sess) {
      sess.token = newToken;
      TKAStorage.saveSession(sess);
    }
    $("#token").text("Token : " + newToken);
  }, 300);
}

function copyTokenToInput() {
  var sess = TKAStorage.getSession();
  if (sess && sess.token) {
    $("#input-token").val(sess.token);
  }
}

function konfirmasiData() {
  var namaPeserta = $("#nama_peserta").val().trim();
  var tgl = $("#tgl").val();
  var bulan = $("#bulan").val();
  var tahun = $("#tahun").val();
  var inputToken = $("#input-token").val().trim().toUpperCase();

  if (namaPeserta === "") {
    alert("Silahkan ketikkan nama !");
    $("#nama_peserta").focus();
    return;
  }
  if (tgl === "" || bulan === "" || tahun === "") {
    alert("Silahkan masukkan tanggal lahir !");
    return;
  }
  if (inputToken === "") {
    alert("Silahkan ketikkan token !");
    $("#input-token").focus();
    return;
  }

  var sess = TKAStorage.getSession();
  var validToken = sess ? (sess.token || "").toUpperCase() : "";

  $("#loader").fadeIn(150);
  $("#btnSubmitKonfData").html("Silahkan tunggu ... !").prop("disabled", true);

  setTimeout(function () {
    $("#loader").fadeOut(150);
    $("#btnSubmitKonfData").html("Submit").prop("disabled", false);

    if (inputToken !== validToken) {
      alert("Token Salah !");
      return;
    }

    if (sess) {
      sess.namaPesertaInput = namaPeserta;
      sess.jenisKelamin = $("#jenis_kelamin").val();
      sess.tglLahir = tgl;
      sess.bulanLahir = bulan;
      sess.tahunLahir = tahun;
      sess.step = "konfirmasi_tes";
      TKAStorage.saveSession(sess);
    }
    switchView("konfirmasi_tes");
  }, 400);
}

// ==================== VIEW 4: KONFIRMASI TES ====================
function mulaiTes() {
  $("#btnMulaiTes").html("Silahkan tunggu ...").prop("disabled", true);
  $("#loader").fadeIn(150);

  setTimeout(function () {
    $("#loader").fadeOut(150);
    $("#btnMulaiTes").html("Mulai").prop("disabled", false);
    var sess = TKAStorage.getSession();
    if (sess) {
      sess.waktuMulai = $("#tes_waktu_mulai").val();
      sess.step = "proses_tes";
      TKAStorage.saveSession(sess);
    }
    switchView("proses_tes");
  }, 400);
}

// ==================== VIEW 5: PROSES TES (CBT ENGINE) ====================
function initExamView() {
  var sess = TKAStorage.getSession();
  if (!sess) {
    switchView("pilih_mapel");
    return;
  }

  var displayUser = sess.namaPesertaInput
    ? sess.kodeNik + " - " + sess.namaPesertaInput.toUpperCase()
    : sess.akunPeserta;
  $("#headerCBTUserName").text(displayUser);
  $("#examMataUjian").text(sess.namaMapel);
  $("#infoModalMapel").text(sess.namaMapel);

  var subj = TKAStorage.getSubjectById(sess.subjectId);
  currentQuestions = subj && Array.isArray(subj.questions) ? subj.questions : [];
  jumlahSoal = currentQuestions.length;

  renderExamQuestionsAndModal(sess);
  lihatSoal(1);
  startExamTimer();

  // Sesuaikan tinggi panel soal pada layar desktop seperti aslinya
  setTimeout(function () {
    adjustExamColumnHeight();
  }, 100);
}

function adjustExamColumnHeight() {
  var w = $(window).width();
  if (w > 991) {
    var h = Math.max(360, $(window).height() - 340);
    $(".cont-soal, .isi-soal").css({
      height: h + "px",
      overflow: "auto"
    });
  } else {
    $(".cont-soal, .isi-soal").css({
      height: "auto",
      overflow: "visible"
    });
  }
}

function renderExamQuestionsAndModal(sess) {
  var qHtml = "";
  var gridHtml = "";

  for (var idx = 0; idx < currentQuestions.length; idx++) {
    var no = idx + 1;
    var q = currentQuestions[idx];
    var savedAns = sess.answers && sess.answers[no] !== undefined ? sess.answers[no] : "";
    var isRagu = sess.ragu && sess.ragu[no] ? true : false;

    var hasStimulus = q.stimulus && q.stimulus.replace(/<[^>]*>/g, "").trim() !== "" && q.stimulus.indexOf("<img") !== -1
      ? true
      : (q.stimulus && q.stimulus.replace(/&nbsp;/g, "").replace(/<[^>]*>/g, "").trim() !== "");

    qHtml += '<div class="soal-soal row" style="display:none" id="soal-no-' + no + '">';
    qHtml +=
      '<div class="col-lg-6 cont-soal" style="padding-right:20px;">' +
      (hasStimulus ? q.stimulus : "<p>&nbsp;</p>") +
      "</div>";
    qHtml += '<div class="col-lg-6 isi-soal" style="border-left:5px dotted #eee;">';
    qHtml += '<div class="question-stem mb-3">' + (q.question || "") + "</div>";

    // Render berdasarkan tipe soal
    if (q.type === "pg") {
      qHtml += '<table class="table" style="margin-top:0px">';
      var opts = q.options || [];
      for (var oIdx = 0; oIdx < opts.length; oIdx++) {
        var opt = opts[oIdx];
        var key = (opt.key || String.fromCharCode(65 + oIdx)).toUpperCase();
        var checked = String(savedAns).toUpperCase() === key ? "checked" : "";
        var inputId = "pilihan_" + no + "_" + oIdx;
        qHtml +=
          '<tr class="option-row-clickable">' +
          '<td style="width:28px;border:0px;padding:4px 0px;">' +
          '<div class="radio icheck-primary">' +
          '<input id="' +
          inputId +
          '" onchange="pilihan(' +
          no +
          ", '" +
          key +
          '\')" name="pilihan' +
          no +
          '" type="radio" value="' +
          key +
          '" ' +
          checked +
          " />" +
          '<label for="' +
          inputId +
          '"></label>' +
          "</div></td>" +
          '<td style="border:0px;padding:6px 4px;" onclick="$(\'#' +
          inputId +
          "').prop('checked', true).trigger('change');\">" +
          opt.text +
          "</td></tr>";
      }
      qHtml += "</table>";
    } else if (q.type === "mcma") {
      var ansArr = savedAns ? String(savedAns).split(";") : [];
      qHtml += '<table class="table" style="margin-top:10px">';
      var optsM = q.options || [];
      for (var mIdx = 0; mIdx < optsM.length; mIdx++) {
        var optM = optsM[mIdx];
        var keyM = (optM.key || String.fromCharCode(65 + mIdx)).toUpperCase();
        var checkedM = ansArr.indexOf(keyM) !== -1 ? "checked" : "";
        var inputIdM = "pilihan_" + no + "_" + mIdx;
        qHtml +=
          '<tr class="option-row-clickable">' +
          '<td style="width:28px;border:0px;padding:4px 0px;">' +
          '<div class="checkbox icheck-primary">' +
          '<input id="' +
          inputIdM +
          '" class="pilihan' +
          no +
          '" onchange="pilihan2(' +
          no +
          ')" name="pilihan' +
          no +
          '" type="checkbox" value="' +
          keyM +
          '" ' +
          checkedM +
          " />" +
          '<label for="' +
          inputIdM +
          '"></label>' +
          "</div></td>" +
          '<td style="border:0px;padding:6px 4px;" onclick="$(\'#' +
          inputIdM +
          "').click();\">" +
          optM.text +
          "</td></tr>";
      }
      qHtml += "</table>";
    } else if (q.type === "kategori") {
      var labels = q.categoryLabels && q.categoryLabels.length >= 2 ? q.categoryLabels : ["Benar", "Salah"];
      var stmts = q.statements || [];
      var savedMap = {};
      if (savedAns) {
        String(savedAns)
          .split(";")
          .forEach(function (p) {
            var kv = p.split("|");
            if (kv.length === 2) savedMap[kv[0]] = kv[1];
          });
      }
      qHtml += '<table class="table table-bordered table-hover" style="margin-top:10px;">';
      qHtml +=
        "<thead><tr>" +
        '<td class="font-weight-bold">Pernyataan</td>' +
        '<td class="text-center font-weight-bold" style="width:100px">' +
        labels[0] +
        "</td>" +
        '<td class="text-center font-weight-bold" style="width:100px">' +
        labels[1] +
        "</td></tr></thead><tbody>";

      for (var sIdx = 0; sIdx < stmts.length; sIdx++) {
        var st = stmts[sIdx];
        var sNum = sIdx + 1;
        var sKey = (st.key || String.fromCharCode(65 + sIdx)).toUpperCase();
        var c1 = savedMap[sKey] === "1" ? "checked" : "";
        var c2 = savedMap[sKey] === "2" ? "checked" : "";
        var id1 = "pilihan_" + no + "_" + sNum + "_1";
        var id2 = "pilihan_" + no + "_" + sNum + "_2";

        qHtml +=
          "<tr>" +
          '<td class="text-left" style="padding:8px 10px;">' +
          st.text +
          "</td>" +
          '<td class="text-center align-middle" style="padding:4px;">' +
          '<div class="checkbox icheck-primary d-inline-block">' +
          '<input id="' +
          id1 +
          '" name="pilihan_' +
          no +
          "_" +
          sNum +
          '" data-skey="' +
          sKey +
          '" onchange="pilihan3(' +
          no +
          ", " +
          stmts.length +
          ')" type="radio" value="1" ' +
          c1 +
          " />" +
          '<label for="' +
          id1 +
          '"></label></div></td>' +
          '<td class="text-center align-middle" style="padding:4px;">' +
          '<div class="checkbox icheck-primary d-inline-block">' +
          '<input id="' +
          id2 +
          '" name="pilihan_' +
          no +
          "_" +
          sNum +
          '" data-skey="' +
          sKey +
          '" onchange="pilihan3(' +
          no +
          ", " +
          stmts.length +
          ')" type="radio" value="2" ' +
          c2 +
          " />" +
          '<label for="' +
          id2 +
          '"></label></div></td></tr>';
      }
      qHtml += "</tbody></table>";
    } else if (q.type === "isian") {
      var valEscaped = $("<div>").text(savedAns || "").html();
      qHtml +=
        '<div class="form-group mt-3">' +
        '<label class="small font-weight-bold text-muted">Ketik jawaban singkat Anda:</label>' +
        '<input type="text" class="form-control" style="border:2px solid #ced4da; border-radius:8px; padding:10px 14px;" ' +
        'id="jawaban_essai_' +
        no +
        '" value="' +
        valEscaped +
        '" placeholder="Tulis jawaban di sini..." oninput="pilihanIsian(' +
        no +
        ')" /></div>';
    }

    qHtml += "</div></div>";

    // Render tombol nomor di Modal Daftar Soal
    var hasAns = savedAns !== undefined && String(savedAns).trim() !== "";
    var badgeCls = hasAns ? "" : "d-none";
    gridHtml +=
      '<span class="d-none" id="tmp_answer_' +
      no +
      '">' +
      (hasAns ? savedAns : "") +
      "</span>" +
      '<span class="d-none" id="ragu_answer_' +
      no +
      '">' +
      (isRagu ? "1" : "") +
      "</span>" +
      '<div id="jawaban-no-' +
      no +
      '" class="btn btn-outline-dark btn-sm mb-2 mr-2 btn-lihat-soal" ' +
      'style="width:36px;height:36px;padding-top:6px;position:relative" onclick="lihatSoal(' +
      no +
      '); $(\'#myModal\').modal(\'hide\');">' +
      no +
      '<div id="answer' +
      no +
      '" class="badge badge-light ' +
      badgeCls +
      '" style="height:16px;width:16px;font-size:9px;border-radius:50%;position:absolute;top:-5px;right:-5px;border:1px solid #000;background:#fff;display:flex;align-items:center;justify-content:center;">' +
      (hasAns ? '<i class="fa fa-check"></i>' : "") +
      "</div></div>";
  }

  $("#questionsContainer").html(qHtml);
  $("#daftarSoalGrid").html(gridHtml);
}

function updateModalButtonsStyle() {
  for (var i = 1; i <= jumlahSoal; i++) {
    var $btn = $("#jawaban-no-" + i);
    var ans = $("#tmp_answer_" + i).text().trim();
    var ragu = $("#ragu_answer_" + i).text().trim();

    $btn.removeClass("btn-primary btn-dark btn-warning btn-outline-dark");
    if (ragu !== "") {
      $btn.addClass("btn-warning");
    } else if (ans !== "") {
      $btn.addClass("btn-dark");
    } else {
      $btn.addClass("btn-outline-dark");
    }
  }
  // Highlight nomor yang sedang dibuka dengan warna biru (btn-primary), kecuali jika ragu-ragu tetap terlihat checkbox-nya
  var $curr = $("#jawaban-no-" + selectedSoal);
  $curr.removeClass("btn-dark btn-outline-dark btn-warning").addClass("btn-primary");
}

function lihatSoal(nomor) {
  nomor = Number(nomor) || 1;
  $(".soal-soal").hide();
  $("#soal-no-" + nomor).show();
  selectedSoal = nomor;
  $("#noSoal").text(nomor);

  var isRagu = $("#ragu_answer_" + nomor).text().trim() !== "";
  $("#c_ragu_ragu").prop("checked", isRagu);

  // Update tombol prev & next
  $("#btnPrevSoal").prop("disabled", selectedSoal <= 1);
  if (selectedSoal >= jumlahSoal) {
    $("#nextSoalLabel").text("Selesai Tes");
  } else {
    $("#nextSoalLabel").text("Soal berikutnya");
  }

  updateModalButtonsStyle();
  adjustExamColumnHeight();
}

function nextSoal() {
  if (selectedSoal < jumlahSoal) {
    selectedSoal++;
    lihatSoal(selectedSoal);
  } else {
    selesaikanTes();
  }
}

function prevSoal() {
  if (selectedSoal > 1) {
    selectedSoal--;
    lihatSoal(selectedSoal);
  }
}

function raguRagu() {
  var isChecked = $("#c_ragu_ragu").is(":checked");
  var sess = TKAStorage.getSession();
  if (isChecked) {
    $("#ragu_answer_" + selectedSoal).text("1");
    if (sess) {
      sess.ragu = sess.ragu || {};
      sess.ragu[selectedSoal] = true;
      TKAStorage.saveSession(sess);
    }
  } else {
    $("#ragu_answer_" + selectedSoal).text("");
    if (sess && sess.ragu) {
      delete sess.ragu[selectedSoal];
      TKAStorage.saveSession(sess);
    }
  }
  updateModalButtonsStyle();
}

function saveUserAnswer(no, val) {
  var strVal = val !== undefined && val !== null ? String(val).trim() : "";
  $("#tmp_answer_" + no).text(strVal);
  if (strVal === "") {
    $("#answer" + no).html("").addClass("d-none");
  } else {
    $("#answer" + no).html('<i class="fa fa-check"></i>').removeClass("d-none");
  }

  var sess = TKAStorage.getSession();
  if (sess) {
    sess.answers = sess.answers || {};
    if (strVal === "") {
      delete sess.answers[no];
    } else {
      sess.answers[no] = strVal;
    }
    TKAStorage.saveSession(sess);
  }
  updateModalButtonsStyle();
}

function pilihan(n, v) {
  saveUserAnswer(n, v.toUpperCase());
}

function pilihan2(n) {
  var jawaban = $(".pilihan" + n + ":checked")
    .map(function () {
      return $(this).val();
    })
    .get()
    .join(";");
  saveUserAnswer(n, jawaban);
}

function pilihan3(n, total) {
  var parts = [];
  for (var i = 1; i <= total; i++) {
    var $checked = $('input[name="pilihan_' + n + "_" + i + '"]:checked');
    if ($checked.length) {
      var sKey = $checked.data("skey") || String.fromCharCode(64 + i);
      parts.push(sKey + "|" + $checked.val());
    }
  }
  saveUserAnswer(n, parts.join(";"));
}

function pilihanIsian(n) {
  var val = $("#jawaban_essai_" + n).val();
  saveUserAnswer(n, val);
}

function changeFont(s, d) {
  $("#isisoal").css("font-size", s + "px");
  $(".cfont").css("font-weight", "normal");
  $("#" + d).css("font-weight", "bold");
}

// ==================== TIMER HITUNG MUNDUR ====================
function formatSecondsToHMS(totalSec) {
  totalSec = Math.max(0, Math.floor(totalSec));
  var h = Math.floor(totalSec / 3600);
  var m = Math.floor((totalSec % 3600) / 60);
  var s = totalSec % 60;
  var pad = function (n) {
    return n < 10 ? "0" + n : "" + n;
  };
  return pad(h) + ":" + pad(m) + ":" + pad(s);
}

function startExamTimer() {
  stopExamTimer();
  var sess = TKAStorage.getSession();
  var rem = sess && typeof sess.remainingSeconds === "number" ? sess.remainingSeconds : 75 * 60;
  $("#countdown").text(formatSecondsToHMS(rem));

  examTimerInterval = setInterval(function () {
    var currentSess = TKAStorage.getSession();
    if (!currentSess) {
      stopExamTimer();
      return;
    }
    currentSess.remainingSeconds = Math.max(0, (currentSess.remainingSeconds || 0) - 1);
    TKAStorage.saveSession(currentSess);
    $("#countdown").text(formatSecondsToHMS(currentSess.remainingSeconds));

    if (currentSess.remainingSeconds <= 0) {
      stopExamTimer();
      $("#timeoutDialog").modal("show");
    }
  }, 1000);
}

function stopExamTimer() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
    examTimerInterval = null;
  }
}

function selesaikanTes() {
  switchView("finish_tes");
}

function backToProsesTes() {
  switchView("proses_tes");
}

function forceFinishTimeout() {
  $("#timeoutDialog").modal("hide");
  goToReviewHasil();
}

function goToReviewHasil() {
  $("#loader").fadeIn(150);
  setTimeout(function () {
    $("#loader").fadeOut(150);
    var sess = TKAStorage.getSession();
    if (sess) {
      sess.finished = true;
      sess.step = "review_hasil";
      TKAStorage.saveSession(sess);
    }
    switchView("review_hasil");
  }, 350);
}

// ==================== VIEW 7: REVIU HASIL & SKOR AKHIR ====================
function formatAnswerDisplay(q, rawAns, isKey) {
  var itemCls = isKey ? "key-item" : "answer-item";
  if (!q) return '<div class="' + itemCls + '">()</div>';

  if (q.type === "pg") {
    var code = (isKey ? q.answer : rawAns || "").toString().trim().toUpperCase();
    if (!code) return '<div class="' + itemCls + '">() <i>Tidak dijawab</i></div>';
    var optObj = (q.options || []).find(function (o, idx) {
      return (o.key || String.fromCharCode(65 + idx)).toUpperCase() === code;
    });
    var textHtml = optObj ? optObj.text : "";
    return '<div class="' + itemCls + '"><b>(' + code + ")</b> " + textHtml + "</div>";
  }

  if (q.type === "mcma") {
    var arr = [];
    var src = isKey ? q.answer : rawAns;
    if (Array.isArray(src)) {
      arr = src.map(function (x) { return String(x).trim().toUpperCase(); }).filter(Boolean);
    } else if (typeof src === "string" && src.trim() !== "") {
      arr = src.split(";").map(function (x) { return x.trim().toUpperCase(); }).filter(Boolean);
    }
    if (arr.length === 0) return '<div class="' + itemCls + '">() <i>Tidak dijawab</i></div>';
    var out = "";
    arr.forEach(function (code) {
      var optObj = (q.options || []).find(function (o, idx) {
        return (o.key || String.fromCharCode(65 + idx)).toUpperCase() === code;
      });
      var textHtml = optObj ? optObj.text : "";
      out += '<div class="' + itemCls + '"><b>(' + code + ")</b> " + textHtml + "</div>";
    });
    return out;
  }

  if (q.type === "kategori") {
    var labels = q.categoryLabels && q.categoryLabels.length >= 2 ? q.categoryLabels : ["Benar", "Salah"];
    var stmts = q.statements || [];
    if (isKey) {
      return stmts
        .map(function (st, idx) {
          var k = (st.key || String.fromCharCode(65 + idx)).toUpperCase();
          var lbl = String(st.answer) === "1" ? labels[0] : labels[1];
          return '<div class="' + itemCls + '"><b>' + k + "</b> (" + lbl + ")</div>";
        })
        .join("");
    } else {
      if (!rawAns || String(rawAns).trim() === "") {
        return '<div class="' + itemCls + '">() <i>Tidak dijawab</i></div>';
      }
      var mapU = {};
      String(rawAns)
        .split(";")
        .forEach(function (pair) {
          var kv = pair.split("|");
          if (kv.length === 2) mapU[kv[0].trim().toUpperCase()] = kv[1].trim();
        });
      return stmts
        .map(function (st, idx) {
          var k = (st.key || String.fromCharCode(65 + idx)).toUpperCase();
          var v = mapU[k];
          var lbl = v === "1" ? labels[0] : v === "2" ? labels[1] : "-";
          return '<div class="' + itemCls + '"><b>' + k + "</b> (" + lbl + ")</div>";
        })
        .join("");
    }
  }

  if (q.type === "isian") {
    var val = isKey ? q.answer : rawAns;
    if (!val || String(val).trim() === "") {
      return '<div class="' + itemCls + '">() <i>Tidak dijawab</i></div>';
    }
    return '<div class="' + itemCls + '">' + $("<div>").text(val).html() + "</div>";
  }

  return '<div class="' + itemCls + '">()</div>';
}

function renderReviewHasil() {
  var sess = TKAStorage.getSession();
  var db = TKAStorage.getDB();
  if (!sess) {
    switchView("pilih_mapel");
    return;
  }

  var displayUser = sess.namaPesertaInput
    ? sess.kodeNik + " - " + sess.namaPesertaInput.toUpperCase()
    : sess.akunPeserta;
  $("#reviewHeaderUser").text(displayUser);
  $("#statPesertaNama").text(sess.namaPesertaInput ? sess.namaPesertaInput.toUpperCase() : "Peserta Simulasi");
  $("#reviewSubjectBadge").html('<i class="fas fa-book mr-2"></i>' + sess.namaMapel);

  var subj = TKAStorage.getSubjectById(sess.subjectId);
  var questions = subj && Array.isArray(subj.questions) ? subj.questions : [];
  var total = questions.length;
  var benar = 0;
  var salah = 0;
  var kosong = 0;

  var rowsHtml = "";
  for (var i = 0; i < total; i++) {
    var no = i + 1;
    var q = questions[i];
    var userAns = sess.answers ? sess.answers[no] : "";
    var evalRes = TKAStorage.evaluateQuestion(q, userAns);

    if (!evalRes.isAnswered) {
      kosong++;
    } else if (evalRes.isCorrect) {
      benar++;
    } else {
      salah++;
    }

    var statusBadge = "";
    if (!evalRes.isAnswered) {
      statusBadge = '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-minus-circle mr-1"></i>Kosong</span>';
    } else if (evalRes.isCorrect) {
      statusBadge = '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Benar</span>';
    } else {
      statusBadge = '<span class="badge badge-danger px-2 py-1"><i class="fas fa-times-circle mr-1"></i>Salah</span>';
    }

    var pembahasanHtml = "";
    if (q.pembahasan && q.pembahasan.trim() !== "" && (!db.settings || db.settings.allowReviewPembahasan !== false)) {
      pembahasanHtml =
        '<div class="pembahasan-box">' +
        '<b><i class="fas fa-lightbulb mr-1 text-warning"></i>Pembahasan:</b><br>' +
        q.pembahasan +
        "</div>";
    }

    rowsHtml +=
      '<tr class="table-row">' +
      '<td class="text-center number-cell">' +
      no +
      "</td>" +
      '<td class="answer-cell">' +
      formatAnswerDisplay(q, userAns, false) +
      "</td>" +
      '<td class="key-cell">' +
      formatAnswerDisplay(q, null, true) +
      pembahasanHtml +
      "</td>" +
      '<td class="text-center align-middle">' +
      statusBadge +
      "</td></tr>";
  }

  var nilaiAkhir = total > 0 ? Math.round((benar / total) * 100) : 0;
  $("#statNilaiAkhir").text(nilaiAkhir);
  $("#statBenar").text(benar);
  $("#statSalah").text(salah);
  $("#statKosong").text(kosong);
  $("#statTotalSoalSub").text("Dari " + total + " Pertanyaan");
  $("#reviewTotalQuestionsText").text(total + " Pertanyaan");
  $("#reviewTableBody").html(rowsHtml);
}

function logoutSimulasi() {
  $("#loader").fadeIn(150);
  setTimeout(function () {
    $("#loader").fadeOut(150);
    switchView("pilih_mapel");
  }, 400);
}

// ==================== INISIALISASI AWAL ====================
$(document).ready(function () {
  // Isi opsi tanggal lahir (Hari 01..31 & Tahun 1990..2022)
  var tglHtml = '<option value="">Hari</option>';
  for (var d = 1; d <= 31; d++) {
    var dd = d < 10 ? "0" + d : "" + d;
    tglHtml += '<option value="' + dd + '">' + dd + "</option>";
  }
  $("#tgl").html(tglHtml);

  var thnHtml = '<option value="">Tahun</option>';
  for (var y = 1990; y <= 2022; y++) {
    thnHtml += '<option value="' + y + '">' + y + "</option>";
  }
  $("#tahun").html(thnHtml);

  // Event handler dropdown mata pelajaran
  $(document).on("click", "#mapel_toggle", function () {
    if ($(this).hasClass("disabled")) return;
    if ($("#mapel_dropdown").is(":visible")) {
      closeMapelDropdown();
    } else {
      openMapelDropdown();
    }
  });

  $(document).on("input", "#mapel_search_input", function () {
    var q = $(this).val().toLowerCase().trim();
    if (q === "") {
      renderMapelOptions(mapelData);
    } else {
      var filtered = $.grep(mapelData, function (item) {
        var full = (item.mapel + " " + (item.paket || "")).toLowerCase();
        return full.indexOf(q) !== -1;
      });
      renderMapelOptions(filtered);
    }
  });

  $(document).on("click", ".mapel-option", function () {
    var val = $(this).data("value");
    var label = $(this).data("label") || $(this).text();
    setMapelValue(val, label);
    closeMapelDropdown();
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#mapel_container").length) {
      closeMapelDropdown();
    }
  });

  $("#jenjang").on("change", function () {
    loadMapelByJenjang($(this).val());
  });

  $("#jenis_mapel").on("change", function () {
    loadMapelByJenjang($("#jenjang").val());
  });

  $(window).on("resize", function () {
    if (!$("#view-proses-tes").hasClass("d-none")) {
      adjustExamColumnHeight();
    }
  });

  // Muat daftar mata pelajaran awal
  loadMapelByJenjang($("#jenjang").val());
});
