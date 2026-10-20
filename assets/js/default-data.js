/**
 * Data Bawaan Simulasi TKA (Tes Kemampuan Akademik) - Pusmendik ANBK Clone
 * Data ini dimuat pertama kali jika belum ada kustomisasi di localStorage.
 * Anda dapat mengubah soal kapan saja melalui Halaman Admin (admin.html)
 * atau dengan mengimpor/mengekspor file JSON.
 */

window.TKA_DEFAULT_DATA = {
  version: "1.0.0",
  settings: {
    defaultUsername: "P130100230",
    defaultPassword: "DHND*",
    defaultNamaPeserta: "P130100230 - PESERTA TKA",
    defaultDurasiMenit: 75,
    showAdminButton: true,
    allowReviewPembahasan: true
  },
  subjects: [
    // ==================== SMA / MA / SMK - WAJIB (jenis_mapel: "1") ====================
    {
      id: "sma_mat_1",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Matematika",
      paket: "Paket 1",
      durasi_menit: 75,
      questions: [
        {
          id: "q1",
          type: "pg", // Pilihan Ganda (1 jawaban benar)
          stimulus: `<p>Sebuah hotel memiliki 30 kamar yang tersedia di lantai 5. Manajer operasional mencatat fasilitas kamar tersebut sebagai berikut.</p>
<ul>
  <li>18 kamar memiliki pemandangan ke arah laut.</li>
  <li>10 kamar memiliki fasilitas tempat tidur <em>Twin Bed</em>.</li>
  <li>6 kamar di antaranya adalah kamar dengan pemandangan laut yang juga memiliki tempat tidur <em>Twin Bed</em>.</li>
  <li>Sisanya adalah kamar standar yang tidak memiliki pemandangan laut maupun fasilitas <em>Twin Bed</em>.</li>
</ul>`,
          question: `<p>Jika saat ini semua kamar di lantai tersebut kosong dan resepsionis memilih satu kamar secara acak untuk tamu yang baru datang, berapakah peluang tamu tersebut mendapatkan kamar dengan pemandangan laut atau tempat tidur <em>Twin Bed</em>?</p>`,
          options: [
            { key: "A", text: `<p><b>1 / 5</b> &nbsp;(&#8533;)</p>` },
            { key: "B", text: `<p><b>8 / 15</b></p>` },
            { key: "C", text: `<p><b>11 / 15</b></p>` },
            { key: "D", text: `<p><b>12 / 15</b></p>` },
            { key: "E", text: `<p><b>14 / 15</b></p>` }
          ],
          answer: "C",
          pembahasan: `Misalkan A = kejadian kamar berpemandangan laut (n(A) = 18) dan B = kejadian kamar berfasilitas Twin Bed (n(B) = 10). Irisan keduanya n(A ∩ B) = 6. Maka n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 18 + 10 - 6 = 22. Peluang P(A ∪ B) = 22/30 = 11/15.`
        },
        {
          id: "q2",
          type: "mcma", // Pilihan Ganda Kompleks Checkbox (>1 jawaban benar)
          stimulus: `<p>Dalam sebuah konferensi teknologi, dipaparkan sejumlah data bahwa dalam satu kelompok data yaitu setiap 10 <em>gadget</em> ramah lingkungan yang diproduksi oleh perusahaan X, rata-rata jenisnya adalah sebagai berikut:</p>
<ul>
  <li>4 unit ponsel pintar (<em>smartphone</em>);</li>
  <li>3 unit jam tangan pintar (<em>smartwatch</em>);</li>
  <li>2 unit komputer tablet; dan</li>
  <li>sisanya adalah unit pelacak lokasi (<em>smart tag</em>).</li>
</ul>
<p>Seorang petugas <em>quality control</em> memilih 1 unit <em>gadget</em> secara acak dari kelompok data tersebut untuk diuji efisiensi dayanya.</p>`,
          question: `<p>Mana saja pernyataan-pernyataan berikut yang benar terkait nilai peluang terpilihnya jenis <em>gadget</em> tersebut?</p>
<p><strong>Pilihlah semua jawaban yang benar! Jawaban benar lebih dari satu.</strong></p>`,
          options: [
            { key: "A", text: `<p>Peluang terpilihnya ponsel pintar adalah 40%.</p>` },
            { key: "B", text: `<p>Peluang terpilihnya <em>gadget</em> bukan komputer tablet adalah 0,2.</p>` },
            { key: "C", text: `<p>Peluang terpilihnya unit pelacak lokasi adalah 1/5.</p>` },
            { key: "D", text: `<p>Peluang terpilihnya <em>gadget</em> bukan jam tangan pintar adalah 70%.</p>` }
          ],
          answer: ["A", "D"],
          pembahasan: `Total gadget = 10 unit (4 smartphone, 3 smartwatch, 2 tablet, 1 smart tag).
- P(smartphone) = 4/10 = 40% (Pernyataan A Benar).
- P(bukan tablet) = (10 - 2)/10 = 0,8 (Pernyataan B Salah).
- P(smart tag) = 1/10 (Pernyataan C Salah).
- P(bukan smartwatch) = (10 - 3)/10 = 7/10 = 70% (Pernyataan D Benar).`
        },
        {
          id: "q3",
          type: "pg",
          stimulus: `<p><strong>Belanja Alat Tulis Sekolah</strong></p>
<p>Koperasi sekolah menyediakan paket alat tulis untuk siswa baru dengan harga satuan yang tetap bagi setiap jenis barang.</p>`,
          question: `<p style="text-align: justify;">Harga 3 buah buku dan 2 buah penggaris Rp18.000,00. Jika harga sebuah buku Rp1.000,00 lebih mahal dari sebuah penggaris, harga 2 buah buku dan 5 buah penggaris adalah ....</p>`,
          options: [
            { key: "A", text: `<p>Rp19.000,00</p>` },
            { key: "B", text: `<p>Rp23.000,00</p>` },
            { key: "C", text: `<p>Rp25.000,00</p>` },
            { key: "D", text: `<p>Rp27.000,00</p>` },
            { key: "E", text: `<p>Rp30.000,00</p>` }
          ],
          answer: "B",
          pembahasan: `Misalkan buku = b dan penggaris = p.
3b + 2p = 18.000 dan b = p + 1.000.
3(p + 1.000) + 2p = 18.000 => 5p + 3.000 = 18.000 => p = 3.000, sehingga b = 4.000.
Maka 2b + 5p = 2(4.000) + 5(3.000) = 8.000 + 15.000 = Rp23.000,00.`
        },
        {
          id: "q4",
          type: "pg",
          stimulus: `<p style="text-align: center;"><strong>Pengusaha di Provinsi Jingga</strong></p>
<p>Pemerintah Provinsi Jingga mendata banyaknya pengusaha yang ada di 7 kota di Provinsi Jingga pada tahun 2026:</p>
<table class="table table-bordered table-sm text-center mt-2 mb-3">
  <thead class="thead-light">
    <tr><th>Kota</th><th>Banyak Pengusaha (Orang)</th></tr>
  </thead>
  <tbody>
    <tr><td>Kota A</td><td>4.500</td></tr>
    <tr><td>Kota B</td><td>3.000</td></tr>
    <tr><td>Kota C</td><td>5.000</td></tr>
    <tr><td>Kota D</td><td>3.500</td></tr>
    <tr><td>Kota E</td><td><b>? (Hilang)</b></td></tr>
    <tr><td>Kota F</td><td>4.000</td></tr>
    <tr><td>Kota G</td><td>3.500</td></tr>
  </tbody>
</table>
<p>Informasi mengenai banyaknya pengusaha di Kota E hilang, namun Pemerintah Provinsi Jingga sudah mengetahui jumlah total pengusaha di Provinsi Jingga sebanyak 25.000 orang.</p>`,
          question: `<p>Berdasarkan informasi tersebut, banyak pengusaha di Kota E adalah ….</p>`,
          options: [
            { key: "A", text: `<p>500 orang</p>` },
            { key: "B", text: `<p>1.500 orang</p>` },
            { key: "C", text: `<p>2.000 orang</p>` },
            { key: "D", text: `<p>2.500 orang</p>` },
            { key: "E", text: `<p>3.000 orang</p>` }
          ],
          answer: "B",
          pembahasan: `Jumlah pengusaha selain Kota E = 4.500 + 3.000 + 5.000 + 3.500 + 4.000 + 3.500 = 23.500 orang.
Banyak pengusaha di Kota E = 25.000 - 23.500 = 1.500 orang.`
        },
        {
          id: "q5",
          type: "pg",
          stimulus: `<p>Rina mulai berinvestasi melalui aplikasi Bobin. Rina memilih produk investasi tipe B2026 karena pada setiap akhir tahun, bunga majemuk sebesar <strong>10% per tahun</strong> langsung ditambahkan ke pokok tabungan selama masa tenor <strong>3 tahun</strong>.</p>
<p>Rina membeli produk investasi B2026 sebesar Rp7.000.000,00 dan berencana menyimpannya sampai jatuh tempo (3 tahun).</p>`,
          question: `<p>Berapakah uang yang diperoleh Rina setelah jatuh tempo?</p>`,
          options: [
            { key: "A", text: `<p>Rp8.470.000,00</p>` },
            { key: "B", text: `<p>Rp9.100.000,00</p>` },
            { key: "C", text: `<p>Rp9.240.000,00</p>` },
            { key: "D", text: `<p>Rp9.261.000,00</p>` },
            { key: "E", text: `<p>Rp9.317.000,00</p>` }
          ],
          answer: "E",
          pembahasan: `Menggunakan rumus bunga majemuk: Mn = M0 × (1 + i)^n = 7.000.000 × (1 + 0,10)^3 = 7.000.000 × 1,331 = Rp9.317.000,00.`
        },
        {
          id: "q6",
          type: "pg",
          stimulus: `<p>&nbsp;</p>`,
          question: `<p>Fungsi <em>f : R &rarr; R</em> dan <em>g : R &rarr; R</em>. Jika <em>g(x) = x &ndash; 1</em> dan <em>(f &#8728; g)(x) = x<sup>3</sup> &ndash; 4x</em>, nilai dari <em>f(2)</em> = ….</p>`,
          options: [
            { key: "A", text: `<p>9</p>` },
            { key: "B", text: `<p>13</p>` },
            { key: "C", text: `<p>15</p>` },
            { key: "D", text: `<p>17</p>` },
            { key: "E", text: `<p>25</p>` }
          ],
          answer: "C",
          pembahasan: `Diketahui f(g(x)) = f(x - 1) = x^3 - 4x. Agar x - 1 = 2, maka substitusikan x = 3:
f(2) = 3^3 - 4(3) = 27 - 12 = 15.`
        },
        {
          id: "q7",
          type: "kategori", // Pilihan Ganda Kompleks Kategori (Benar/Salah)
          stimulus: `<p>Pak Budi ingin membuka cabang baru kafe dalam waktu 12 bulan. Modal awal yang ia miliki saat ini adalah Rp50.000.000,00. Total dana yang dibutuhkan untuk pembukaan cabang baru adalah Rp200.000.000,00.</p>
<p>Untuk mencapai target tersebut, Pak Budi akan menyisihkan laba usahanya mulai bulan Januari. Tabungan bulan pertama Pak Budi adalah Rp5.000.000,00 dan berkomitmen meningkatkan besar tabungannya secara tetap sebesar Rp1.500.000,00 setiap bulannya. Berikut hambatan yang dialami oleh Pak Budi:</p>
<ol>
  <li>Pada bulan ke-5 dan ke-9, Pak Budi harus mengeluarkan Rp5.000.000,00 dari tabungannya untuk biaya tak terduga.</li>
  <li>Mulai bulan ke-7, kenaikan tabungan per bulan berkurang sebesar 20% dari kenaikan awal karena persaingan usaha.</li>
  <li>Pak Budi hanya dapat membuka cabang baru jika total tabungan bersih (termasuk modal awal) mencapai minimal Rp200.000.000,00.</li>
</ol>`,
          question: `<p>Kondisi seperti apakah yang dapat membuat Pak Budi membuka cabang baru kafe dalam waktu 12 bulan?</p>
<p><strong>Tentukan Benar atau Salah pada setiap pernyataan berikut!</strong></p>`,
          categoryLabels: ["Benar", "Salah"],
          statements: [
            {
              key: "A",
              text: `<p>Dengan kendala yang ada, Pak Budi tetap dapat membuka cabang baru.</p>`,
              answer: "2" // 1 = Benar, 2 = Salah
            },
            {
              key: "B",
              text: `<p>Pak Budi dapat membuka cabang baru dan membayar semua pengeluaran tak terduga jika tidak ada persaingan usaha.</p>`,
              answer: "2"
            },
            {
              key: "C",
              text: `<p>Dengan meningkatkan jumlah tabungan secara tetap menjadi selalu bertambah sebesar Rp1.700.000,00 per bulan (tanpa kendala persaingan), maka Pak Budi dapat membuka cabang baru dan membayar semua pengeluaran tak terduganya.</p>`,
              answer: "1"
            }
          ],
          pembahasan: `Tanpa persaingan (b = 1,5 juta), S12 = 12/2 × (2(5) + 11(1,5)) = 6 × 26,5 = 159 juta. Dikurangi biaya tak terduga 10 juta = 149 juta. Ditambah modal awal 50 juta = 199 juta (< 200 juta, sehingga A dan B Salah). Jika kenaikan b = 1,7 juta, S12 = 6 × (10 + 18,7) = 172,2 juta, dikurangi 10 juta + modal 50 juta = 212,2 juta >= 200 juta (Pernyataan C Benar).`
        }
      ]
    },
    {
      id: "sma_mat_2",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Matematika",
      paket: "Paket 2",
      durasi_menit: 75,
      questions: [
        {
          id: "q2_1",
          type: "pg",
          stimulus: `<p>Dari selembar karton berbentuk persegi yang berukuran sisi 30 cm akan dibuat kotak tanpa tutup, dengan cara menggunting empat persegi identik berukuran <em>x</em> cm di setiap pojok karton, kemudian melipat sisi-sisinya ke atas.</p>`,
          question: `<p>Volume kotak terbesar yang dapat dibuat adalah ....</p>`,
          options: [
            { key: "A", text: `<p>2.000 cm&sup3;</p>` },
            { key: "B", text: `<p>3.000 cm&sup3;</p>` },
            { key: "C", text: `<p>4.000 cm&sup3;</p>` },
            { key: "D", text: `<p>5.000 cm&sup3;</p>` },
            { key: "E", text: `<p>6.000 cm&sup3;</p>` }
          ],
          answer: "A",
          pembahasan: `V(x) = x(30 - 2x)^2. Turunan V'(x) = (30 - 2x)(30 - 6x) = 0, diperoleh x = 5 cm. Maka V(5) = 5 × (30 - 10)^2 = 5 × 400 = 2.000 cm³.`
        }
      ]
    },
    {
      id: "sma_bind_1",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Bahasa Indonesia",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: [
        {
          id: "bind_1",
          type: "pg",
          stimulus: `<p><strong>Transformasi Ekosistem Digital bagi UMKM di Indonesia</strong></p>
<p style="text-align: justify;">Perkembangan teknologi finansial dan lokapasar (<em>marketplace</em>) dalam satu dekade terakhir telah mengubah lanskap perdagangan ritel di Indonesia. Pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) kini memiliki akses langsung ke konsumen lintas daerah tanpa harus bergantung pada rantai distribusi konvensional yang panjang.</p>
<p style="text-align: justify;">Meskipun demikian, survei Kementerian Koperasi dan UKM menunjukkan bahwa adopsi digital belum sepenuhnya merata. Tantangan utama yang dihadapi pelaku UMKM di daerah meliputi keterbatasan literasi digital, manajemen stok yang masih manual, serta ketatnya persaingan harga dengan produk impor di platform daring.</p>`,
          question: `<p>Ide pokok paragraf kedua pada teks informasi di atas adalah ....</p>`,
          options: [
            { key: "A", text: `<p>Perubahan lanskap perdagangan ritel di Indonesia akibat lokapasar.</p>` },
            { key: "B", text: `<p>Kemudahan akses pelaku UMKM ke konsumen lintas daerah.</p>` },
            { key: "C", text: `<p>Kendala dan ketidakmerataan adopsi digital yang dihadapi pelaku UMKM.</p>` },
            { key: "D", text: `<p>Dominasi produk impor dalam persaingan harga di platform daring.</p>` },
            { key: "E", text: `<p>Peran Kementerian Koperasi dan UKM dalam menghapus rantai distribusi.</p>` }
          ],
          answer: "C",
          pembahasan: `Kalimat utama paragraf kedua terletak di awal paragraf: adopsi digital UMKM belum sepenuhnya merata dan menghadapi sejumlah tantangan (literasi digital, manajemen stok, dan persaingan harga).`
        },
        {
          id: "bind_2",
          type: "kategori",
          stimulus: `<p><strong>Transformasi Ekosistem Digital bagi UMKM di Indonesia</strong></p>
<p style="text-align: justify;">Perkembangan teknologi finansial dan lokapasar (<em>marketplace</em>) dalam satu dekade terakhir telah mengubah lanskap perdagangan ritel di Indonesia. Pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) kini memiliki akses langsung ke konsumen lintas daerah tanpa harus bergantung pada rantai distribusi konvensional yang panjang.</p>
<p style="text-align: justify;">Meskipun demikian, survei Kementerian Koperasi dan UKM menunjukkan bahwa adopsi digital belum sepenuhnya merata. Tantangan utama yang dihadapi pelaku UMKM di daerah meliputi keterbatasan literasi digital, manajemen stok yang masih manual, serta ketatnya persaingan harga dengan produk impor di platform daring.</p>`,
          question: `<p>Berdasarkan bacaan di atas, tentukan apakah pernyataan berikut <strong>Benar</strong> atau <strong>Salah</strong>!</p>`,
          categoryLabels: ["Benar", "Salah"],
          statements: [
            {
              key: "A",
              text: `<p>Lokapasar memungkinkan UMKM menjangkau konsumen di luar daerah secara langsung.</p>`,
              answer: "1"
            },
            {
              key: "B",
              text: `<p>Seluruh UMKM di daerah telah menerapkan sistem manajemen stok secara otomatis.</p>`,
              answer: "2"
            },
            {
              key: "C",
              text: `<p>Keterbatasan literasi digital menjadi salah satu penghambat pemerataan adopsi digital UMKM.</p>`,
              answer: "1"
            }
          ],
          pembahasan: `Pernyataan A dan C sesuai dengan isi teks, sedangkan pernyataan B bertentangan karena manajemen stok sebagian UMKM masih dilakukan secara manual.`
        }
      ]
    },
    {
      id: "sma_bind_2",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Bahasa Indonesia",
      paket: "Paket 2",
      durasi_menit: 60,
      questions: []
    },
    {
      id: "sma_bing_1",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Bahasa Inggris",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: [
        {
          id: "bing_1",
          type: "pg",
          stimulus: `<p><strong>Urban Vertical Farming</strong></p>
<p style="text-align: justify;">As global urban populations continue to grow, traditional agriculture faces increasing pressure from limited arable land and climate variability. Vertical farming—the practice of growing crops in vertically stacked layers indoors—offers a promising alternative. By utilizing controlled-environment agriculture (CEA) technology, vertical farms can regulate light, humidity, and nutrients precisely while using up to 90% less water than conventional field farming.</p>`,
          question: `<p>What is the main advantage of vertical farming mentioned in the passage?</p>`,
          options: [
            { key: "A", text: `<p>It completely eliminates the need for electricity and artificial lighting.</p>` },
            { key: "B", text: `<p>It significantly reduces water consumption while controlling growing conditions.</p>` },
            { key: "C", text: `<p>It requires larger rural land areas than conventional farming.</p>` },
            { key: "D", text: `<p>It relies entirely on natural rainfall and seasonal weather patterns.</p>` },
            { key: "E", text: `<p>It replaces all urban residential buildings with greenhouses.</p>` }
          ],
          answer: "B",
          pembahasan: `Teks menyebutkan bahwa vertical farming menggunakan teknologi CEA untuk mengatur cahaya, kelembapan, serta nutrisi secara presisi sekaligus menghemat air hingga 90%.`
        }
      ]
    },
    {
      id: "sma_bing_2",
      jenjang: "sma",
      jenis_mapel: "1",
      mapel: "Bahasa Inggris",
      paket: "Paket 2",
      durasi_menit: 60,
      questions: []
    },

    // ==================== SMA / MA / SMK - PILIHAN (jenis_mapel: "2") ====================
    { id: "sma_mat_lanjut_1", jenjang: "sma", jenis_mapel: "2", mapel: "Matematika Tingkat Lanjut", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_fis_1", jenjang: "sma", jenis_mapel: "2", mapel: "Fisika", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_kim_1", jenjang: "sma", jenis_mapel: "2", mapel: "Kimia", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_bio_1", jenjang: "sma", jenis_mapel: "2", mapel: "Biologi", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_eko_1", jenjang: "sma", jenis_mapel: "2", mapel: "Ekonomi", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_geo_1", jenjang: "sma", jenis_mapel: "2", mapel: "Geografi", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_sos_1", jenjang: "sma", jenis_mapel: "2", mapel: "Sosiologi", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_sej_1", jenjang: "sma", jenis_mapel: "2", mapel: "Sejarah", paket: "Paket 1", durasi_menit: 75, questions: [] },
    { id: "sma_ppkn_1", jenjang: "sma", jenis_mapel: "2", mapel: "Pendidikan Pancasila dan Kewarganegaraan", paket: "Paket 1", durasi_menit: 75, questions: [] },

    // ==================== SMP / MTs - WAJIB (jenis_mapel: "1") ====================
    {
      id: "smp_mat_1",
      jenjang: "smp",
      jenis_mapel: "1",
      mapel: "Matematika - SMP Sederajat",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: [
        {
          id: "smp_q1",
          type: "pg",
          stimulus: `<p>Sebuah taman berbentuk persegi panjang memiliki ukuran panjang 20 meter dan lebar 14 meter. Di sekeliling taman tersebut akan dipasang lampu taman dengan jarak antar lampu 4 meter.</p>`,
          question: `<p>Berapakah banyak lampu taman yang dibutuhkan?</p>`,
          options: [
            { key: "A", text: `<p>15 lampu</p>` },
            { key: "B", text: `<p>17 lampu</p>` },
            { key: "C", text: `<p>20 lampu</p>` },
            { key: "D", text: `<p>34 lampu</p>` }
          ],
          answer: "B",
          pembahasan: `Keliling taman = 2 × (20 + 14) = 68 meter. Banyak lampu = 68 / 4 = 17 lampu.`
        }
      ]
    },
    {
      id: "smp_bind_1",
      jenjang: "smp",
      jenis_mapel: "1",
      mapel: "Bahasa Indonesia - SMP Sederajat",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: []
    },

    // ==================== SD / MI - WAJIB (jenis_mapel: "1") ====================
    {
      id: "sd_mat_1",
      jenjang: "sd",
      jenis_mapel: "1",
      mapel: "Matematika - SD Sederajat",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: [
        {
          id: "sd_q1",
          type: "pg",
          stimulus: `<p>Ibu membeli 3 kotak kue bolu. Setiap kotak berisi 12 potong kue. Kue tersebut akan dibagikan secara merata kepada 9 orang tetangga.</p>`,
          question: `<p>Berapa potong kue yang diterima oleh setiap tetangga?</p>`,
          options: [
            { key: "A", text: `<p>3 potong</p>` },
            { key: "B", text: `<p>4 potong</p>` },
            { key: "C", text: `<p>6 potong</p>` },
            { key: "D", text: `<p>9 potong</p>` }
          ],
          answer: "B",
          pembahasan: `Total kue = 3 × 12 = 36 potong. Setiap tetangga menerima 36 ÷ 9 = 4 potong kue.`
        }
      ]
    },
    {
      id: "sd_bind_1",
      jenjang: "sd",
      jenis_mapel: "1",
      mapel: "Bahasa Indonesia - SD Sederajat",
      paket: "Paket 1",
      durasi_menit: 60,
      questions: []
    }
  ]
};
