export const tools = [
  {
    id: 'pdf-merge',
    name: 'PDF Splicer / Merger',
    slug: 'pdf-merge',
    description: 'Gabungkan beberapa PDF, susun ulang, atau hapus halaman secara lokal.',
    icon: 'FileText',
    category: 'Dokumen & Perkantoran',
    isNew: false,
    isBeta: false
  },
  {
    id: 'pdf-to-table',
    name: 'PDF to Table',
    slug: 'pdf-to-table',
    description: 'Ekstrak konten PDF menjadi tabel terstruktur (CSV/Excel).',
    icon: 'TableProperties',
    category: 'Dokumen & Perkantoran',
    isNew: true,
    isBeta: false
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    slug: 'pdf-compressor',
    description: 'Kompres ukuran file PDF secara lokal tanpa upload ke server.',
    icon: 'FileArchive',
    category: 'Dokumen & Perkantoran',
    isNew: true,
    isBeta: false
  },
  {
    id: 'image-to-pdf',
    name: 'Image ↔ PDF',
    slug: 'image-to-pdf',
    description: 'Konversi JPG/PNG ke PDF, atau ekstrak halaman PDF menjadi gambar.',
    icon: 'Image',
    category: 'Dokumen & Perkantoran',
    isNew: false,
    isBeta: false
  },
  {
    id: 'excel-cleaner',
    name: 'Data Cleaner',
    slug: 'excel-cleaner',
    description: 'Rapikan file Excel/CSV, hapus duplikat, dan normalisasi tanggal.',
    icon: 'Table',
    category: 'Dokumen & Perkantoran',
    isNew: false,
    isBeta: false
  },
  {
    id: 'text-case',
    name: 'Text Case & List Formatter',
    slug: 'text-case',
    description: 'Ubah teks menjadi UPPERCASE, lowercase, dan format list.',
    icon: 'Type',
    category: 'Dokumen & Perkantoran',
    isNew: false,
    isBeta: false
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    slug: 'background-remover',
    description: 'Hapus latar belakang gambar otomatis di browser (Client-side ML).',
    icon: 'Scissors',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: true
  },
  {
    id: 'image-enhancer',
    name: 'Image Enhancer',
    slug: 'image-enhancer',
    description: 'Perjelas gambar blur (sharpen), atur brightness, contrast, dan saturation.',
    icon: 'Wand2',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    slug: 'image-converter',
    description: 'Konversi format gambar antara PNG, JPEG, WebP, BMP, & ICO secara lokal.',
    icon: 'RefreshCw',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'image-compressor',
    name: 'Smart Image Compressor',
    slug: 'image-compressor',
    description: 'Kompres gambar massal (JPG/PNG/WebP) dengan kualitas tinggi.',
    icon: 'Minimize',
    category: 'Gambar & Aset Visual',
    isNew: false,
    isBeta: false
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    slug: 'image-cropper',
    description: 'Crop gambar dengan bebas, dimensi kustom, atau rasio preset.',
    icon: 'Crop',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'social-cropper',
    name: 'Social Media Multi-Cropper',
    slug: 'social-cropper',
    description: 'Crop satu gambar ke berbagai ukuran media sosial sekaligus.',
    icon: 'Crop',
    category: 'Gambar & Aset Visual',
    isNew: false,
    isBeta: false
  },
  {
    id: 'watermark',
    name: 'Watermark Stamp',
    slug: 'watermark',
    description: 'Tambahkan teks atau logo watermark transparan ke gambar secara massal.',
    icon: 'Stamp',
    category: 'Gambar & Aset Visual',
    isNew: false,
    isBeta: false
  },
  {
    id: 'color-picker',
    name: 'Color Picker & Palette',
    slug: 'color-picker',
    description: 'Pilih warna, dapatkan kode HEX/RGB/HSL, dan simpan riwayat.',
    icon: 'Palette',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    slug: 'qr-generator',
    description: 'Buat QR Code kustom dengan warna, bentuk, dan logo di tengah.',
    icon: 'QrCode',
    category: 'Produktivitas & Utilitas',
    isNew: false,
    isBeta: false
  },
  {
    id: 'table-viewer',
    name: 'JSON / CSV Viewer',
    slug: 'table-viewer',
    description: 'Buka dan visualisasikan file JSON atau CSV mentah menjadi tabel interaktif.',
    icon: 'Database',
    category: 'Produktivitas & Utilitas',
    isNew: false,
    isBeta: false
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    slug: 'word-counter',
    description: 'Hitung kata, karakter, dan estimasi waktu baca secara real-time.',
    icon: 'Hash',
    category: 'Produktivitas & Utilitas',
    isNew: false,
    isBeta: false
  },
  {
    id: 'unit-converter',
    name: 'Unit & Dimension Converter',
    slug: 'unit-converter',
    description: 'Konversi satuan panjang, berat, ukuran data, dan kurs statis.',
    icon: 'Scale',
    category: 'Produktivitas & Utilitas',
    isNew: false,
    isBeta: false
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    slug: 'markdown-editor',
    description: 'Editor Markdown bersih dengan preview live dan fitur ekspor.',
    icon: 'FileCode',
    category: 'Produktivitas & Utilitas',
    isNew: false,
    isBeta: false
  },
  {
    id: 'color-palette-extractor',
    name: 'Color Palette Extractor',
    slug: 'color-palette-extractor',
    description: 'Ekstrak palet warna dominan dari gambar. Dapatkan kode HEX dan RGB.',
    icon: 'Pipette',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'image-metadata-viewer',
    name: 'Image Metadata Viewer',
    slug: 'image-metadata-viewer',
    description: 'Lihat data EXIF gambar (dimensi, ukuran, model kamera, GPS, tanggal).',
    icon: 'Info',
    category: 'Gambar & Aset Visual',
    isNew: true,
    isBeta: false
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    slug: 'base64-encoder',
    description: 'Encode teks/gambar ke Base64, atau decode string Base64 kembali.',
    icon: 'Code',
    category: 'Produktivitas & Utilitas',
    isNew: true,
    isBeta: false
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    slug: 'json-formatter',
    description: 'Format dan validasi struktur JSON mentah, tampilkan error jika ada.',
    icon: 'Braces',
    category: 'Produktivitas & Utilitas',
    isNew: true,
    isBeta: false
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    description: 'Uji pola regex secara real-time dengan menyorot hasil yang cocok.',
    icon: 'SearchCode',
    category: 'Produktivitas & Utilitas',
    isNew: true,
    isBeta: false
  },
  {
    id: 'pomodoro-timer',
    name: 'Pomodoro / Focus Timer',
    slug: 'pomodoro-timer',
    description: 'Timer fokus standar (25m kerja / 5m istirahat) dengan notifikasi suara.',
    icon: 'Timer',
    category: 'Produktivitas & Utilitas',
    isNew: true,
    isBeta: false
  }
];

export const categories = [
  'Dokumen & Perkantoran',
  'Gambar & Aset Visual',
  'Produktivitas & Utilitas'
];
