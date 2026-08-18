# Product Requirements Document (PRD)

# Kilat — Browser Utility Tools

> **Nama kerja:** "Kilat" (placeholder, dapat diganti)
> **Versi dokumen:** 1.0
> **Tanggal:** 2026-08-17
> **Status:** Draft untuk development
> **Referensi konsep:** delphi.tools — kumpulan tools yang sepenuhnya berjalan di browser

---

## 1. Ringkasan Eksekutif

Kilat adalah situs kumpulan **13 utility tools** yang **100% diproses di sisi klien (browser)** — tanpa sign-in, tanpa server pemrosesan, tanpa unggahan file ke cloud. File pengguna tidak pernah meninggalkan perangkat mereka; semua komputasi (merge PDF, kompresi gambar, hingga penghapusan latar berbasis machine learning) berjalan lokal via JavaScript, WebAssembly, dan Web Worker.

Situs dibangun dengan **TanStack Start** (React 19 + TypeScript + Vite) dan **shadcn/ui**, dengan bahasa desain **monokrom hitam-putih** serta **toggle dark/light mode**.

**Proposisi nilai utama:**

1. **Privasi absolut** — tidak ada upload; cocok untuk dokumen kantor sensitif.
2. **Nol friksi** — buka URL, langsung pakai, langsung unduh hasil. Tanpa akun, tanpa iklan pop-up yang mengganggu, tanpa paywall.
3. **Instan & offline-capable** — setelah aset dimuat, sebagian besar tool tetap berfungsi saat koneksi lambat/putus.

---

## 2. Latar Belakang & Peluang

- Pekerja kantoran, admin, kreator konten, dan seller e-commerce rutin mencari tools mikro di Google: *"gabung pdf online"*, *"hapus background foto"*, *"compress jpg"*, *"word counter"*, dll.
- Pemain lama (iLovePDF, Smallpdf, remove.bg) mengandalkan **upload ke server**, membatasi ukuran/jumlah file gratis, dan mendorong registrasi/paywall.
- WebAssembly dan library client-side modern (pdf-lib, ONNX Runtime Web, dsb.) kini cukup matang untuk memindahkan seluruh pemrosesan ke browser — menghilangkan biaya server per-file sekaligus menjadikan privasi sebagai fitur jualan.
- Model bisnis jangka panjang (di luar scope PRD ini): iklan display ringan, sponsorship, atau donasi — bukan paywall fitur.

---

## 3. Prinsip Produk

| # | Prinsip | Implikasi |
|---|---------|-----------|
| P1 | **No sign-in, no account** | Tidak ada sistem auth sama sekali. Preferensi (tema, draft) hanya di `localStorage`. |
| P2 | **Client-side only processing** | Tidak ada endpoint upload. Server/CDN hanya melayani aset statis + SSR shell. |
| P3 | **Privacy by default** | Tidak ada tracking pada konten file. Analytics (jika ada) bersifat agregat & anonim (mis. Plausible/Umami), hanya menghitung pageview. |
| P4 | **Instant** | Tool sederhana harus bisa dipakai < 3 detik dari first paint. Library berat di-lazy-load per tool. |
| P5 | **Monokrom tegas** | Hitam-putih-abu saja. Hierarki visual dibangun dari kontras, tipografi, dan ruang — bukan warna aksen. |
| P6 | **Satu tugas, satu halaman** | Setiap tool fokus pada satu pekerjaan dengan UI minimal (pola delphi.tools). |
| P7 | **Mobile-first** | Mayoritas traffic tools mikro datang dari pencarian mobile. |

---

## 4. Target Pengguna

| Persona | Kebutuhan | Tools utama |
|---------|-----------|-------------|
| **Staf admin / back office** | Rapikan data Excel, gabung dokumen PDF, scan ke PDF | 1A, 1B, 1C, 1D |
| **Seller e-commerce / kreator sosmed** | Foto produk cepat: hapus latar, kompres, crop, watermark | 2A, 2B, 2C, 2D, 3A |
| **Penulis / mahasiswa / developer** | Hitung kata, format teks, edit Markdown, lihat data JSON | 1D, 3B, 3C, 3E |
| **Pengguna umum** | Konversi satuan, buat QR untuk link/QRIS | 3A, 3D |

---

## 5. Ruang Lingkup

### 5.1 In-scope (v1)

- 13 tools pada 3 kategori (detail di Bagian 9).
- Homepage katalog + pencarian tool, halaman per kategori, halaman per tool.
- Halaman statis: Tentang, Privasi, FAQ.
- Dark/light mode toggle; monokrom theme.
- SEO on-page (metadata, structured data, konten panduan singkat per tool).
- Responsif penuh (mobile, tablet, desktop).

### 5.2 Out-of-scope (v1)

- Akun pengguna, sinkronisasi antarperangkat, riwayat file.
- Backend pemrosesan / upload API apa pun.
- OCR (teks dari gambar), tanda tangan digital, enkripsi/unlock PDF ber-password.
- Edit PDF tingkat lanjut (anotasi, form filling).
- Kurs mata uang real-time (v1 memakai **kurs statis** dengan disclaimer).
- PWA/offline penuh & internasionalisasi multi-bahasa (direncanakan fase lanjut; konten v1: Bahasa Indonesia).

---

## 6. Arsitektur & Tech Stack

### 6.1 Stack inti

| Lapisan | Teknologi | Catatan |
|---------|-----------|---------|
| Framework | **TanStack Start** (Release Candidate) di atas **TanStack Router + Vite + Nitro** | Full-document SSR/streaming untuk SEO; dapat berjalan sebagai SPA untuk halaman tool. API sudah stabil namun versi **di-pin** dan release notes dipantau. |
| Bahasa | **TypeScript** (strict) + **React 19** | — |
| UI library | **shadcn/ui** (template resmi TanStack Start) + **Tailwind CSS v4** | Komponen dimiliki di repo (`src/components/ui`), mudah dikustomisasi ke monokrom. |
| Ikon | `lucide-react` (bawaan ekosistem shadcn) | Ikon garis tipis cocok untuk monokrom. |
| State | React state lokal + URL search params (TanStack Router, type-safe) | Tanpa store global kecuali tema. |
| Deployment | Statis/SSR universal via Nitro: **Cloudflare Workers/Pages, Netlify, atau Vercel** | Tidak ada database; biaya hosting mendekati nol. |

**Setup awal (referensi):**

```bash
npx @tanstack/cli@latest create        # pilih TanStack Start + Tailwind CSS
npx shadcn@latest init                 # atau: pnpm dlx shadcn@latest init -t start
npx shadcn@latest add button card dialog dropdown-menu tabs input slider select switch textarea table command badge separator tooltip sonner
```

### 6.2 Strategi rendering

- **Halaman marketing/katalog/tool shell** → SSR/prerender untuk SEO & LCP cepat.
- **Logika tool** → 100% client-side. Library berat (pdf-lib, pdfjs, ONNX, SheetJS, dsb.) di-**dynamic import** hanya saat halaman tool dibuka.
- **Pemrosesan berat** (kompresi massal, background removal, render PDF) → **Web Worker** agar UI tidak freeze, dengan progress bar.
- Semua hasil diunduh via `Blob` + `URL.createObjectURL()`; zip massal via `fflate` (ringan) atau `jszip`.

### 6.3 Peta library per tool

| Tool | Library utama (kandidat) | Lisensi |
|------|--------------------------|---------|
| 1A PDF Splicer | `pdf-lib` (gabung/susun/hapus halaman) + `pdfjs-dist` (thumbnail halaman) + `dnd-kit` (drag & drop) | MIT / Apache-2.0 / MIT |
| 1B Image ↔ PDF | `pdf-lib` (embed JPG/PNG), `pdfjs-dist` (render halaman ke canvas), `fflate` (zip batch) | MIT/Apache-2.0 |
| 1C CSV/Excel Cleaner | `SheetJS (xlsx)` + `PapaParse` (CSV) + `date-fns` (normalisasi tanggal) | Apache-2.0 / MIT / MIT |
| 1D Text Case & List | JavaScript murni + Clipboard API | — |
| 2A Background Remover | **Keputusan terbuka (lihat Risiko R1):** `@imgly/background-removal` (AGPL-3.0) **atau** `onnxruntime-web` / `@huggingface/transformers.js` + model RMBG-1.4/MODNet (Apache-2.0) | AGPL-3.0 vs Apache-2.0 |
| 2B Image Compressor | `browser-image-compression` atau `@jsquash/*` (mozjpeg/oxipng/webp WASM dari Squoosh) | MIT / Apache-2.0 |
| 2C Multi-Cropper | `react-easy-crop` atau `cropperjs` + Canvas API | MIT |
| 2D Watermark | Canvas API murni | — |
| 3A QR Generator | `qr-code-styling` (warna, bentuk dot, logo tengah, error-correction H) | MIT |
| 3B Table Viewer | `PapaParse` + `@tanstack/react-table` + `@tanstack/react-virtual` (data besar) | MIT |
| 3C Word Counter | JavaScript murni (regex Unicode-aware); Flesch-Kincaid opsional untuk EN | — |
| 3D Unit Converter | Definisi satuan internal atau `convert-units`; kurs statis via JSON lokal | MIT |
| 3E Markdown Editor | CodeMirror 6 (`@codemirror/lang-markdown`) atau textarea + `marked`/`markdown-it` + `DOMPurify` (sanitasi preview) | MIT |

### 6.4 Batas ukuran file (rekomendasi default v1)

| Jenis | Batas | Catatan |
|-------|-------|---------|
| PDF per file | 50 MB, total 200 MB | Batasi jumlah halaman preview thumbnail (maks 100) |
| Gambar per file | 30 MB / 50 MP | Downscale input ekstrem sebelum diproses |
| CSV/Excel | 20 MB / 100.000 baris | Di atas itu: tampilkan peringatan + mode streaming |
| Teks/Markdown | 5 MB | — |
| Background removal | 12 MP per gambar | Keterbatasan memori WASM; resize otomatis dengan info ke user |

Batas ditampilkan jelas di UI sebelum user memilih file; pelanggaran memunculkan pesan error yang manusiawi.

---

## 7. Desain UI/UX

### 7.1 Bahasa visual: Monokrom

- **Palet:** skala netral murni — `white → zinc-100…zinc-950 → black`. **Tanpa warna aksen sama sekali**; status (sukses/error) tetap memakai pola monokrom (solid vs outline, ikon, tekstur garis) dengan tetap memenuhi kontras WCAG AA.
- **Light mode:** latar putih, teks near-black, border `zinc-200`.
- **Dark mode:** latar near-black (`zinc-950`), teks `zinc-50`, border `zinc-800`.
- **Tipografi:** sans modern (mis. Inter / Geist); angka & ukuran file dalam `font-mono`.
- **Signature element:** komponen dengan border 1px tegas, radius kecil (`rounded-md`/`rounded-lg`), bayangan minim; micro-interaction halus (hover invert, underline offset).

### 7.2 Tema & toggle

- Dark mode via **class strategy** (`.dark` pada `<html>`), mengikuti pola shadcn/ui.
- Toggle Sun/Moon di header (komponen `dropdown-menu` atau `button` sederhana): Light / Dark / System.
- Preferensi disimpan di `localStorage`; default mengikuti `prefers-color-scheme`; anti-FOUC via inline script kecil di `<head>` root route.

### 7.3 Struktur halaman

**Global layout (`__root.tsx`):**

- **Header:** logo wordmark monokrom · link Kategori · tombol **Search tools** (`Cmd/Ctrl + K`, komponen `command`) · **Theme toggle**.
- **Main:** konten halaman.
- **Footer:** navigasi sekunder · link Privasi/Tentang · badge **"100% diproses di browser — file tidak pernah diunggah"**.

**Homepage:**

- Hero singkat (1 kalimat nilai + search bar besar).
- Grid kartu tool (komponen `card`), dikelompokkan per kategori, tiap kartu: ikon, nama, deskripsi 1 baris.
- Section trust: "Tanpa upload · Tanpa akun · Gratis".

**Halaman tool (pola seragam — `ToolShell`):**

1. **Header tool:** ikon + nama + deskripsi 1 kalimat + badge "Lokal & Privat".
2. **Area kerja** (dropzone / editor / kontrol).
3. **Panel hasil** + tombol unduh/salin.
4. **FAQ singkat + panduan 3 langkah** (konten SEO, dapat di-collapse).
5. **"Tools terkait"** (3 kartu).

### 7.4 Komponen bersama (dipakai lintas tool)

| Komponen | Fungsi |
|----------|--------|
| `FileDropzone` | Drag & drop + file picker, validasi tipe/ukuran, multi-file |
| `FileList` | Daftar file terpilih: nama, ukuran, thumbnail, hapus, reorder |
| `ProgressTask` | Progress bar/indeterminate + status teks (untuk worker) |
| `DownloadBar` | Tombol unduh utama + unduh semua (zip) + salin ke clipboard |
| `CompareSlider` | Before/after untuk kompresi & background removal |
| `ResultStat` | Statistik hasil (mis. "1,2 MB → 340 KB · −72%") |
| `PrivacyNote` | Strip kecil: "File diproses lokal di perangkat Anda" |
| `EmptyState` / `ErrorState` | Ilustrasi garis monokrom + CTA jelas |

### 7.5 Aksesibilitas

- Kontras minimal **WCAG AA** di kedua tema; fokus ring terlihat jelas.
- Semua aksi inti dapat dioperasikan keyboard (dropzone punya fallback button; reorder via tombol naik/turun selain drag).
- `aria-live` untuk status proses; label bahasa Indonesia yang jelas.

---

## 8. Arsitektur Informasi & Routing

```
/                        Homepage (katalog + search)
/tools                   Semua tools (grid + filter kategori)
/tools/{slug}            Halaman tool (13 halaman)
/kategori/{slug}         Halaman kategori (3 halaman) — opsional, bisa anchor di /tools
/tentang                 Tentang proyek
/privasi                 Kebijakan privasi (penting untuk trust)
/faq                     FAQ umum
```

| Slug tool | Judul halaman (ID) | Target keyword utama |
|-----------|--------------------|----------------------|
| `pdf-merge` | Gabung & Pisah PDF Online | gabung pdf, pisah halaman pdf |
| `image-to-pdf` | JPG ke PDF / PDF ke JPG | jpg ke pdf, pdf ke jpg |
| `excel-cleaner` | Pembersih Data Excel/CSV | rapikan data excel, hapus duplikat csv |
| `text-case` | Text Case & List Formatter | ubah huruf besar kecil online |
| `background-remover` | Hapus Background Foto | hapus background foto online |
| `image-compressor` | Kompres Foto Online | compress jpg, perkecil ukuran foto |
| `social-cropper` | Crop Gambar Media Sosial | crop foto instagram 1:1 9:16 |
| `watermark` | Watermark Foto Online | tambah watermark foto |
| `qr-generator` | QR Code Generator + Logo | buat qr code dengan logo |
| `table-viewer` | JSON & CSV Table Viewer | buka file json online |
| `word-counter` | Penghitung Kata & Karakter | hitung kata, word counter |
| `unit-converter` | Konversi Satuan & Dimensi | konversi cm ke inch, px ke cm |
| `markdown-editor` | Markdown Editor Online | markdown editor online |

SEO teknis: `sitemap.xml`, `robots.txt`, canonical, OpenGraph per halaman, structured data `WebApplication`/`SoftwareApplication` + `FAQPage` per tool.

---

## 9. Spesifikasi Fitur

Setiap tool mengikuti template yang sama: **Deskripsi · Alur pengguna · Fitur wajib (MVP) · Nice-to-have · Input/Output · Edge case · Acceptance criteria · Library**.

---

### Kategori 1 — Dokumen & Perkantoran (Office & PDF Essentials)

#### 1A. PDF Page Splicer / Merger (Penggabung & Pemisah PDF)

- **Deskripsi:** Gabungkan beberapa PDF, susun ulang urutan file/halaman, hapus halaman tertentu, lalu unduh satu PDF hasil — semuanya lokal via `pdf-lib`.
- **Alur pengguna:**
  1. Drop beberapa PDF → daftar file + grid thumbnail halaman dirender via `pdfjs-dist`.
  2. User drag untuk mengatur urutan file/halaman (dnd-kit) dan/atau menandai halaman untuk dihapus.
  3. Klik **Gabungkan** → progress → unduh `hasil-gabungan.pdf`.
- **Fitur wajib:**
  - Multi-file PDF (urutan dapat diubah), mode tampilan **per file** dan **per halaman**.
  - Hapus halaman (klik tombol X pada thumbnail; bisa undo sebelum merge).
  - Rotasi halaman per 90° (bonus murah dari pdf-lib).
  - Nama file output dapat diubah.
- **Nice-to-have:** duplikat halaman; rentang halaman per file (mis. "hal. 1–5 saja"); mode "pisah" (ekspor tiap halaman sebagai PDF terpisah dalam zip).
- **Input:** PDF (maks 50 MB/file, 200 MB total, ≤ 100 halaman preview). **Output:** 1 PDF (atau zip PDF pada mode pisah).
- **Edge case:** PDF terenkripsi/ber-password → deteksi saat load, tampilkan error "PDF terproteksi tidak didukung (v1)". PDF korup → error per file, file lain tetap diproses. Halaman sangat banyak → thumbnail lazy-render.
- **Acceptance criteria:**
  - Menggabungkan 3 PDF menghasilkan satu file dengan urutan & halaman persis seperti pengaturan user.
  - Urutan hasil merge sesuai hasil drag (termasuk reorder lintas file pada mode halaman).
  - Tidak ada network request saat pemrosesan (dapat diverifikasi via DevTools offline setelah load).

#### 1B. Image to PDF / PDF to Image Converter

- **Deskripsi:** Dua arah dalam satu halaman (tabs): (a) JPG/PNG → satu PDF rapi; (b) PDF → gambar PNG/JPG per halaman.
- **Alur pengguna (a):** drop foto → atur urutan → pilih ukuran halaman (A4 fit / sesuai gambar), orientasi, margin → unduh PDF.
  **Alur pengguna (b):** drop PDF → pilih format (PNG/JPG), skala/DPI (72/150/300) → render via pdfjs ke canvas → unduh per halaman atau zip.
- **Fitur wajib:** reorder gambar; kualitas JPG adjustable; estimasi ukuran output; batch zip.
- **Nice-to-have:** preset "scan dokumen" (A4 + kontras naik); nomor halaman otomatis.
- **Input:** JPG/PNG/WebP (maks 30 MB/file); PDF ≤ 50 MB. **Output:** PDF tunggal, atau PNG/JPG (zip jika > 1 halaman).
- **Edge case:** gambar EXIF rotation → normalisasi orientasi; PDF 200 halaman → batasi & sarankan split; warna transparan PNG → latar putih saat JPG.
- **Acceptance criteria:**
  - 10 foto scan menghasilkan 1 PDF 10 halaman dengan urutan benar dan ukuran A4-fit.
  - PDF 3 halaman menghasilkan 3 PNG pada DPI 150 yang dapat diunduh sebagai zip.

#### 1C. CSV / Excel Data Cleaner (Pembersih Data)

- **Deskripsi:** Drop file CSV/XLSX berantakan → sistem merapikan data dengan operasi yang dapat dicentang → preview before/after → unduh hasil bersih (XLSX/CSV).
- **Operasi wajib (checkbox, default aman):**
  - Trim spasi berlebih (termasuk double-space & spasi awal/akhir) di semua sel teks.
  - **Normalisasi format tanggal** ke satu format pilihan (`YYYY-MM-DD`, `DD/MM/YYYY`, `DD MMM YYYY`) — deteksi format umum Indonesia (`31/12/2025`, `31-12-2025`, `31 Des 2025`) via date-fns + parser kustom.
  - **Hapus baris duplikat** (seluruh baris identik, atau berdasarkan kolom kunci pilihan user).
  - Hapus baris/kolom kosong total.
  - Normalisasi kapitalisasi kolom tertentu (opsional: Title Case / UPPER / lower per kolom).
- **Alur pengguna:** drop file → pilih sheet (jika XLSX multi-sheet) → centang operasi → tabel preview menandai sel yang berubah (diff highlight monokrom: coretan vs bold) → unduh.
- **Nice-to-have:** ringkasan laporan ("1.240 sel di-trim, 37 duplikat dibuang, 112 tanggal dinormalisasi"); simpan preset operasi di localStorage.
- **Input:** CSV/TSV/XLSX ≤ 20 MB / 100 rb baris. **Output:** XLSX (default) atau CSV.
- **Edge case:** tanggal ambigu (03/04/2025 = 3 April atau 4 Maret?) → asumsi format Indonesia DD/MM dengan catatan; encoding CSV non-UTF8 → PapaParse auto-detect + pilihan manual; formula Excel → nilai hasil (value) yang dibawa, formula tidak dipertahankan (tampilkan peringatan).
- **Acceptance criteria:**
  - File uji dengan spasi acak, 3 format tanggal campur, dan 50 duplikat menghasilkan output bersih sesuai operasi tercentang + laporan ringkasan akurat.
  - Preview diff menandai dengan benar minimal per-baris yang berubah.

#### 1D. Text Case & List Formatter

- **Deskripsi:** Kotak teks besar + toolbar aksi instan. Dua tab: **Case** dan **List**.
- **Fitur wajib (Case):** UPPERCASE · lowercase · Title Case · Sentence case · camelCase · PascalCase · snake_case · kebab-case.
- **Fitur wajib (List):** tambah penomoran (1. 2. 3.) · bullet (•/-) · hapus penomoran/bullet · urutkan A→Z / Z→A · hapus baris duplikat · hapus baris kosong · trim tiap baris.
- **Fitur umum:** statistik mini (karakter/baris), tombol **Salin**, **Unduh .txt**, **Reset**. Konversi berlaku pada seleksi jika ada, seluruh teks jika tidak.
- **Nice-to-have:** inverse case; alternating; "slugify" (untuk URL); kapitalisasi mengabaikan kata kecil (a/an/the/dan/atau/yang) untuk Title Case.
- **Edge case:** teks multibahasa dengan diakritik → gunakan `toLocaleUpperCase('id')`; paste dari Word dengan smart quote → opsi "straighten quotes".
- **Acceptance criteria:**
  - Semua transformasi idempoten & reversible jika memungkinkan; salin ke clipboard berfungsi di Chrome/Firefox/Safari dengan toast konfirmasi.

---

### Kategori 2 — Gambar & Aset Visual (Image & Media Tools)

#### 2A. Instant Background Remover

- **Deskripsi:** Hapus latar foto produk/profil langsung di browser memakai model ML client-side (WASM/WebGPU). **Fitur unggulan** — paling kompleks secara teknis.
- **Alur pengguna:**
  1. Drop 1 gambar → pertama kali, model diunduh (±30–40 MB) dengan **progress bar jelas** + penjelasan "model disimpan di browser untuk kunjungan berikutnya" (cache via Cache API/IndexedDB).
  2. Hasil transparan tampil dengan **CompareSlider** (before/after, latar checkerboard).
  3. Opsi latar pengganti: transparan / putih / warna solid pilihan → unduh PNG (atau JPG bila latar solid).
- **Fitur wajib:** indikator download model + estimasi; proses di Web Worker; cancel; batch kecil (maks 5 gambar berurutan).
- **Nice-to-have:** refine edge (feather slider); preset ukuran pas foto dengan latar putih; mode WebGPU bila tersedia (fallback WASM).
- **Input:** JPG/PNG/WebP ≤ 30 MB (otomatis downscale ke ≤ 12 MP untuk inferensi, hasil di-upscale kembali dengan info). **Output:** PNG transparan / JPG.
- **Edge case:** perangkat low-memory (mobile lama) → deteksi `navigator.deviceMemory`, tawarkan resolusi lebih kecil; download model gagal → retry + pesan jelas; gambar dengan subjek kompleks (rambut) → ekspektasi dikelola via contoh di FAQ.
- **Acceptance criteria:**
  - Foto produk 2 MB menghasilkan PNG transparan ≤ 15 detik di laptop mid-range (WASM) setelah model ter-cache.
  - Setelah kunjungan pertama, proses ulang tidak mengunduh ulang model (terverifikasi offline).

> ⚖️ **Catatan lisensi (keputusan sebelum build):** `@imgly/background-removal` berlisensi **AGPL-3.0** — gratis jika source code situs dibuka (open source), atau perlu lisensi komersial dari IMG.LY. Alternatif bebas: `onnxruntime-web`/`@huggingface/transformers.js` + model Apache-2.0 (mis. RMBG-1.4 / MODNet). Lihat Risiko R1.

#### 2B. Smart Image Compressor

- **Deskripsi:** Kompres PNG/JPG massal hingga ~70% lebih kecil tanpa penurunan visual signifikan.
- **Alur pengguna:** drop banyak gambar → daftar file dengan progress per item → hasil menampilkan ukuran awal → akhir + persentase hemat → unduh satu-satu atau **Unduh semua (zip)**.
- **Fitur wajib:**
  - Mode kualitas: slider kualitas (1–100) + preset (Kecil/Seimbang/Kualitas); target: "ramah web".
  - Pilihan output: pertahankan format / konversi ke **WebP** (dan AVIF jika codec tersedia).
  - Resize opsional: batasi sisi terpanjang (mis. 1920 px).
  - CompareSlider per gambar.
- **Nice-to-have:** target ukuran file ("di bawah 500 KB"); strip metadata EXIF (default on, privasi).
- **Input:** JPG/PNG/WebP ≤ 30 MB/file, maks 20 file/batch. **Output:** sama/zip.
- **Edge case:** PNG transparan → codec yang mempertahankan alpha; gambar kecil (< 50 KB) → info "sudah optimal"; total memori batch besar → antrean worker (maks 2 paralel).
- **Acceptance criteria:**
  - Foto JPEG 3 MB menghasilkan ≤ 900 KB pada preset Seimbang tanpa artefak kasat mata pada 100% zoom.
  - Batch 10 file selesai dengan statistik total hemat dan zip valid.

#### 2C. Social Media Multi-Cropper

- **Deskripsi:** Crop satu gambar mentah ke berbagai ukuran standar platform sekaligus.
- **Alur pengguna:** drop gambar → pilih preset rasio/platform (multi-select) → atur crop per rasio (area crop interaktif, zoom/pan) → **Ekspor semua** → zip berisi file per ukuran.
- **Preset wajib:**
  - Rasio bebas: **1:1** (feed), **9:16** (story/reels), **16:9** (landscape), **4:5** (portrait feed).
  - Platform: IG feed 1080×1080, IG story 1080×1920, X/Twitter header 1500×500, YouTube thumbnail 1280×720, LinkedIn post 1200×627, banner bebas.
- **Fitur wajib:** grid overlay (rule of thirds); lock rasio; output PNG/JPG + kualitas; penamaan file otomatis (`nama_1x1.png`).
- **Nice-to-have:** smart crop suggestion (deteksi wajah/subjek sederhana via center-weight); preset kustom tersimpan.
- **Edge case:** gambar lebih kecil dari target → peringatan upscale; rotasi EXIF dinormalisasi.
- **Acceptance criteria:**
  - Satu foto 4000×3000 diekspor ke 1:1 + 9:16 + header X dalam satu zip dengan dimensi piksel persis sesuai preset.

#### 2D. Watermark Stamp

- **Deskripsi:** Tambahkan watermark teks atau logo transparan ke foto/dokumen-gambar sebelum dibagikan.
- **Fitur wajib:**
  - **Teks:** konten, ukuran, opacity (0–100%), posisi 9-grid, rotasi (−45°…45°), margin.
  - **Logo:** upload PNG/SVG, skala, opacity, posisi 9-grid.
  - **Mode tile/pola:** ulangi watermark diagonal di seluruh gambar (untuk dokumen).
  - Batch: terapkan pengaturan sama ke banyak gambar → zip.
  - Warna watermark: hitam/putih (+ picker untuk kasus khusus; UI tetap monokrom).
- **Nice-to-have:** preview live pada thumbnail grid; preset "DOKUMEN — RAHASIA".
- **Input:** JPG/PNG ≤ 30 MB, maks 20 file. **Output:** format sama (PNG bila sumber PNG).
- **Edge case:** gambar sangat gelap/terang → hint menaikkan kontras watermark; logo lebih besar dari gambar → auto-fit.
- **Acceptance criteria:**
  - Watermark teks opacity 40% mode tile terlihat merata pada hasil unduhan, posisi konsisten lintas ukuran gambar batch.

---

### Kategori 3 — Produktivitas & Utilitas Sehari-hari (Daily Utilities)

#### 3A. QR Code Generator with Logo

- **Deskripsi:** Buat QR kustom untuk tautan (website, pembayaran/QRIS-static link, Wi-Fi, teks) dengan warna dan logo di tengah.
- **Fitur wajib:**
  - Tipe konten: URL · teks bebas · Wi-Fi (SSID/password) · email (mailto) · WhatsApp (wa.me) · vCard sederhana.
  - Kustomisasi via `qr-code-styling`: warna dot & background (default monokrom), bentuk dot (square/rounded/dots), bentuk corner, **upload logo tengah**.
  - Error correction otomatis **Level H** saat logo dipakai + peringatan bila logo > 30% luas ("QR mungkin sulit dipindai").
  - **Tombol uji:** "Pindai dengan kamera HP Anda" + indikator validasi internal (dekode hasil render untuk memastikan terbaca).
  - Unduh **PNG** (256/512/1024/2048 px) dan **SVG**.
- **Nice-to-have:** riwayat desain di localStorage; frame teks ("Scan me").
- **Edge case:** input URL tanpa protokol → auto-prepend `https://`; konten sangat panjang (> 500 karakter) → peringatan kepadatan QR tinggi.
- **Acceptance criteria:**
  - QR dengan logo 25% luas, level H, lulus validasi dekode internal; SVG valid dibuka di Illustrator/Figma.

#### 3B. JSON / CSV Table Viewer & Visualizer

- **Deskripsi:** Buka file JSON (array objek) atau CSV mentah → tampil sebagai tabel interaktif yang searchable/sortable — tanpa upload.
- **Fitur wajib:**
  - Input: drop file, paste teks, atau URL data (fetch CORS-allowed).
  - Tabel via TanStack Table: sort per kolom, **global search**, filter per kolom (teks/angka), pagination, column visibility toggle.
  - Auto-detect tipe kolom (angka/tanggal/boolean) untuk sort yang benar.
  - Statistik ringkas: jumlah baris/kolom, kolom numerik: min/max/rata-rata.
  - Virtualisasi (TanStack Virtual) untuk > 1.000 baris.
  - Ekspor hasil filter ke CSV/JSON.
- **Nice-to-have:** bar chart mini per kolom numerik (visualizer sederhana); pretty-print mode tree untuk JSON nested.
- **Input:** ≤ 20 MB / 100 rb baris. **Edge case:** JSON bukan array objek (nested) → tampilkan tree viewer fallback + opsi "pilih array path"; delimiter CSV aneh → auto-detect PapaParse + pilihan manual.
- **Acceptance criteria:**
  - CSV 50 rb baris tetap smooth discroll (virtualisasi aktif, tanpa frame drop parah).
  - Filter + sort dapat dikombinasikan dan hasilnya dapat diekspor.

#### 3C. Word, Character & Readability Counter

- **Deskripsi:** Paste artikel/draf email → statistik lengkap real-time.
- **Fitur wajib:** kata · karakter (dengan/tanpa spasi) · kalimat · paragraf · **estimasi waktu baca** (asumsi 200 kpm, adjustable) · waktu bicara (130 kpm) · kata unik · **frekuensi kata teratas** (top 10, abaikan stopwords ID/EN).
- **Nice-to-have:** skor keterbacaan Flesch-Kincaid (konten EN) dengan label; indikator panjang ideal untuk meta description (160 kar) / judul SEO (60 kar).
- **Edge case:** emoji/karakter astral → hitung via `Array.from` (grapheme-aware dengan `Intl.Segmenter` bila tersedia).
- **Acceptance criteria:**
  - Angka berubah < 50 ms setelah mengetik (debounced); penghitungan konsisten dengan standar umum (selisih < 1% vs referensi).

#### 3D. Unit & Currency / Dimension Converter

- **Deskripsi:** Konverter satuan praktis + dimensi cetak.
- **Kategori wajib:** panjang (mm/cm/m/km/inch/ft/mil) · berat (g/kg/ton/oz/lb) · suhu (°C/°F/K) · luas · volume (ml/l/galon) · kecepatan · **ukuran data (KB/MB/GB — desimal & biner)** · waktu.
- **Mode dimensi cetak:** **pixel ↔ cm/mm/inch** dengan input DPI (default 96/150/300) — untuk kebutuhan desain cetak dokumen.
- **Mata uang (statis):** tabel kurs IDR ↔ USD/EUR/SGD/JPY/dst. dalam **JSON lokal** dengan label besar: *"Kurs statis per {tanggal} — bukan kurs real-time"*; admin memperbarui file saat deploy.
- **Fitur wajib:** konversi dua arah real-time; tombol swap; salin hasil; format ribuan Indonesia (titik) + desimal (koma) dengan opsi format internasional.
- **Edge case:** angka sangat besar/kecil → notasi ilmiah opsional; input koma desimal Indonesia diterima.
- **Acceptance criteria:**
  - 1 inch = 2,54 cm tepat; 300 px @ 300 DPI = 1 inch tepat; seluruh konversi lolos unit test terhadap tabel referensi.

#### 3E. Distraction-Free Markdown Editor & Converter

- **Deskripsi:** Editor Markdown bersih: buat baru, upload `.md` existing, edit dengan preview, simpan/unduh.
- **Fitur wajib:**
  - Editor (CodeMirror 6 dengan highlighting Markdown, atau textarea minimal) + **preview live** (split view di desktop; toggle Edit/Preview di mobile).
  - Render via `marked`/`markdown-it` + **sanitasi DOMPurify** (HTML mentah di-off-kan default untuk keamanan).
  - Toolbar ringkas: H1–H3, bold, italic, link, list, quote, code, tabel.
  - **Upload .md** (drop/pilih file) · **Unduh .md** · **Salin sebagai HTML** · salin teks mentah.
  - Draft otomatis tersimpan di `localStorage` (dengan indikator "tersimpan lokal · hh:mm") + tombol hapus draft.
  - Statistik kata/karakter di status bar.
- **Nice-to-have:** mode fokus penuh (semua chrome disembunyikan); ekspor HTML mandiri; dukungan GFM (tabel, strikethrough, task list).
- **Edge case:** file > 5 MB ditolak dengan pesan; preview di-sanitize (diverifikasi tidak mengeksekusi `<script>`/event handler).
- **Acceptance criteria:**
  - Siklus penuh: upload → edit → reload halaman (draft pulih) → unduh → file identik dengan isi editor.
  - XSS test string (`<img src=x onerror=...>`) tidak tereksekusi di preview.

---

## 10. Kebutuhan Non-Fungsional

### 10.1 Performa

| Metrik | Target |
|--------|--------|
| LCP (halaman tool, 4G mobile) | < 2,5 s |
| INP | < 200 ms |
| CLS | < 0,1 |
| JS awal per halaman tool ringan (gzip) | < 300 KB (library berat lazy-loaded) |
| Bundle tool 2A | Terpisah & hanya dimuat saat user membuka halaman/memulai proses |
| Pemrosesan berat | Wajib di Web Worker; UI tetap responsif (progress bar) |

### 10.2 Privasi & keamanan

- **Zero-upload:** tidak ada `fetch`/`XMLHttpRequest` yang mengirim konten file pengguna. Diverifikasi via network inspection & uji offline (tool tetap berfungsi setelah aset ter-cache).
- Dependency di-audit (`npm audit`, pin versi); CSP ketat; `DOMPurify` untuk semua render konten pengguna.
- Halaman **Privasi** menjelaskan dengan bahasa sederhana: apa yang disimpan lokal (tema, draft Markdown, preset) dan cara menghapusnya.
- Model ML (tool 2A) di-serve dari CDN/domain sendiri dengan integrity hash.

### 10.3 Kompatibilitas

- Chrome/Edge, Firefox, Safari (2 versi mayor terakhir), mobile Safari & Chrome Android.
- Wajib: WebAssembly, Web Worker, Canvas, File API, Blob. Deteksi fitur + fallback pesan "browser tidak didukung" yang sopan.
- `OffscreenCanvas`/`createImageBitmap` bila tersedia, dengan fallback canvas biasa (Safari).

### 10.4 Reliabilitas & kualitas

- Unit test untuk semua fungsi transformasi murni (1C, 1D, 3C, 3D) — Vitest.
- E2E smoke test per tool (Playwright): alur happy path upload → proses → unduh.
- Fixture file uji (PDF multi-halaman, XLSX kotor, gambar besar, JSON nested) disimpan di repo `tests/fixtures`.
- Error boundary per tool: kegagalan pemrosesan tidak merusak seluruh aplikasi; pesan error manusiawi + tombol coba lagi.

### 10.5 SEO & konten

- SSR/prerender semua halaman; metadata + OpenGraph unik per tool.
- Structured data: `WebApplication` per tool, `FAQPage`, `BreadcrumbList`.
- Tiap halaman tool memuat panduan "Cara pakai" 3 langkah + 3–5 FAQ (konten asli, Bahasa Indonesia).
- Target long-tail keyword sesuai tabel slug (Bagian 8); internal link antar tool terkait.

### 10.6 Analytics (opsional, privacy-friendly)

- Plausible/Umami self-host atau cloud: hanya pageview & referrer. **Dilarang** melacak nama file, konten, atau hasil pemrosesan.

---

## 11. Metrik Keberhasilan

| Metrik | Target 3 bulan | Target 6 bulan |
|--------|---------------|----------------|
| Pengunjung organik/bulan | 10.000 | 50.000 |
| Halaman tool terindeks Google | 13/13 | 13/13 + konten blog |
| Task success rate (E2E synthetics) | > 99% | > 99,5% |
| Bounce rate halaman tool | < 45% | < 40% |
| Core Web Vitals "Good" (CrUX) | ≥ 90% URL | ≥ 95% URL |
| Cross-tool navigation (pengguna pakai > 1 tool/sesi) | > 10% | > 15% |

---

## 12. Risiko & Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|--------|--------|----------|
| R1 | **Lisensi AGPL-3.0** `@imgly/background-removal` mewajibkan source code dibuka atau lisensi komersial | Hukum/produk | **Keputusan di awal:** (a) open-source-kan repo, (b) beli lisensi IMG.LY, atau (c) pakai `onnxruntime-web`/`transformers.js` + model Apache-2.0 (RMBG-1.4/MODNet). Rekomendasi: (c) untuk kebebasan penuh. |
| R2 | TanStack Start masih **Release Candidate** | Teknis | API sudah dinyatakan stabil; pin versi, baca release notes tiap upgrade, siapkan fallback: eject ke TanStack Router murni (SPA) — arsitektur client-side membuat ini murah. |
| R3 | Model ML ±30–40 MB memberatkan first-use 2A | UX | Lazy-load saat user memulai, progress jujur, cache permanen, CDN edge, fallback resolusi rendah. |
| R4 | File raksasa membuat tab crash (memori browser) | UX | Batas ukuran (Bagian 6.4), worker + streaming, downscale preventif, pesan error jelas. |
| R5 | QR ber-logo gagal dipindai | Kualitas | Force error-correction H, batas logo 30%, validasi dekode internal sebelum unduh. |
| R6 | SheetJS CE di npm tidak diperbarui | Teknis | Instal dari CDN resmi (docs.sheetjs.com) sesuai dokumentasi, atau evaluasi fork/alternatif; isolasi di satu modul `lib/spreadsheet.ts`. |
| R7 | Monokrom murni menurunkan affordance/status clarity | UX | Status via ikon + pola (bukan warna), uji kontras AA, uji usability 5 pengguna. |
| R8 | Safari quirks (OffscreenCanvas, WASM threads, COOP/COEP) | Teknis | Deteksi fitur + fallback single-thread; uji device farm; hindari shared-array-buffer sebagai dependency wajib. |
| R9 | Kurs statis menyesatkan pengguna | Reputasi | Disclaimer mencolok + tanggal kurs + link sumber resmi; pertimbangkan fetch kurs publik gratis di fase lanjut. |

---

## 13. Roadmap & Phasing

> Estimasi mengasumsikan 1 developer full-stack fokus. Prioritas: validasi fondasi + tools ber-impact tinggi/effort rendah lebih dulu, fitur WASM berat di belakang.

### Fase 0 — Fondasi (Minggu 1)

- Scaffold TanStack Start + Tailwind v4 + shadcn/ui; tema monokrom + dark/light toggle; layout global (header/footer, `Cmd+K` search); komponen bersama (`FileDropzone`, `DownloadBar`, dst.); CI, lint, testing setup; deployment pipeline.

### Fase 1 — MVP "Tools Cepat" (Minggu 2–4)

- 1D Text Case & List Formatter
- 3C Word & Readability Counter
- 3D Unit & Dimension Converter (kurs statis)
- 3A QR Code Generator with Logo
- 3E Markdown Editor
- Homepage + `/tools` + halaman Privasi/Tentang + SEO dasar (metadata, sitemap, structured data).

**Milestone:** situs live dengan 5 tools; submit ke Google Search Console.

### Fase 2 — Office & PDF Suite (Minggu 5–8)

- 1B Image ↔ PDF
- 1A PDF Page Splicer/Merger
- 1C CSV/Excel Data Cleaner
- 3B JSON/CSV Table Viewer

### Fase 3 — Media Suite (Minggu 9–12)

- 2B Smart Image Compressor
- 2D Watermark Stamp
- 2C Social Media Multi-Cropper
- 2A Instant Background Remover (setelah keputusan lisensi R1)

**Milestone:** 13/13 tools live.

### Fase 4 — Growth & Polish (Bulan 4+)

- PWA installable + offline penuh untuk tools ringan.
- Konten blog/panduan SEO; halaman alternatif ("alternatif iLovePDF tanpa upload").
- Preset tersimpan lintas kunjungan; mode batch lanjutan.
- Evaluasi monetisasi ringan (iklan display/sponsor) tanpa mengorbankan UX.
- i18n (EN) bila trafik internasional muncul.

---

## 14. Struktur Proyek (referensi)

```
src/
├── routes/
│   ├── __root.tsx            # shell: header, footer, theme, Cmd+K
│   ├── index.tsx             # homepage katalog
│   ├── tools.index.tsx       # semua tools
│   ├── tools.$slug.tsx       # loader halaman tool → render komponen tool
│   ├── tentang.tsx / privasi.tsx / faq.tsx
│   └── kategori.$slug.tsx
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── shared/               # FileDropzone, FileList, DownloadBar, CompareSlider, ...
│   └── layout/               # Header, Footer, ThemeToggle, ToolSearch
├── tools/                    # satu folder per tool: komponen + logika murni + worker
│   ├── pdf-merge/
│   │   ├── component.tsx
│   │   ├── logic.ts          # fungsi murni (mudah di-unit-test)
│   │   └── worker.ts         # pemrosesan berat
│   └── ...
├── lib/                      # utils, spreadsheet.ts, theme.ts, seo.ts
├── workers/                  # shared workers
└── styles/app.css            # Tailwind v4 + variabel tema monokrom
```

Prinsip: **logika tool dipisah dari komponen** (`logic.ts` murni → unit test; `worker.ts` → eksekusi berat; `component.tsx` → UI shadcn). Registry `tools/index.ts` memetakan slug → metadata (nama, deskripsi, ikon, kategori, keyword SEO) sehingga katalog, sitemap, dan `Cmd+K` ter-generate otomatis dari satu sumber.

---

## 15. Referensi

- TanStack Start — docs: https://tanstack.com/start/latest
- shadcn/ui — instalasi TanStack Start: https://ui.shadcn.com/docs/installation/tanstack
- pdf-lib: https://pdf-lib.js.org · PDF.js: https://mozilla.github.io/pdf.js/
- SheetJS: https://docs.sheetjs.com · PapaParse: https://www.papaparse.com
- background-removal-js (AGPL-3.0): https://github.com/imgly/background-removal-js
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/ · Transformers.js: https://huggingface.co/docs/transformers.js
- Squoosh codecs (@jsquash): https://github.com/jamsinclair/jSquash · browser-image-compression: https://github.com/Donaldcwl/browser-image-compression
- qr-code-styling: https://qr-code-styling.com
- TanStack Table/Virtual: https://tanstack.com/table · dnd-kit: https://dndkit.com
- CodeMirror 6: https://codemirror.net · marked: https://marked.js.org · DOMPurify: https://github.com/cure53/DOMPurify

---

*Dokumen ini adalah living document — perbarui saat keputusan R1 (lisensi background remover) dan hasil Fase 0 selesai.*
