# NAIRISTEM Workshop • Detailing & Auto Care OS

> **Productized Master Template** untuk Administrasi & Operasional Bengkel Auto Detailing, Paint Protection Film (PPF), Ceramic Coating, dan Workshop Mobil Modern.

Built with **React + Vite + TypeScript + Tailwind CSS + Lucide Icons + Supabase**.

---

## 🌟 Fitur Utama (B2B Detailing Operations)

1. **Dashboard Antrean & Kanban SPK (Information-First)**
   - Alur tahapan standar detailing: `[Antrean Masuk] -> [Cuci & Detailing] -> [Finishing / QC] -> [Siap Diambil] -> [Selesai]`.
   - Kartu mobil berdensitas data tinggi: Plat nomor font monospaced, model kendaraan, nama owner, nomor kontak, nama lead detailer, dan komisi mekanik.
   - Stage progression satu klik (Maju/Mundur status).

2. **Form Check-in & Inspeksi Fisik (Mobile-First Montir)**
   - Desain ramah sentuhan (Thumb-Friendly, touch target minimal 48px).
   - Diagram baret interaktif (Interactive Car Scratch Map) 5 sisi: Atas/Kap, Depan, Belakang, Sisi Kiri, dan Sisi Kanan.
   - Upload dokumentasi foto kondisi awal sebelum pengerjaan.
   - Checklist paket layanan detailing (Coating Platinum, Paint Correction, Glass Polish, Interior Detailing, dll).

3. **Halaman Publik Live Tracking Pelanggan (`/track/:plate_number`)**
   - **Akses Publik Tanpa Login**: Pelanggan cukup membuka link dengan nomor platnya (contoh: `/track/B1988NAI`).
   - Tampilan mewah & elegan bertema **Digital Concierge Dealer Resmi**.
   - Stepper animasi progress pengerjaan live, rincian SPK, transparansi foto inspeksi fisik dan diagram baret masuk.
   - Tombol langsung *"Hubungi Workshop via WhatsApp"*.

4. **Integrasi WhatsApp wa.me Otomatis**
   - Mengubah otomatis format nomor lokal (`08xx`) menjadi standar internasional (`628xx`).
   - Tombol *"Kirim Link WA"*: Template pesan konfirmasi masuk + tautan live tracking.
   - Tombol *"Notif Siap WA"*: Template konfirmasi bahwa kendaraan sudah selesai dan siap diambil di delivery bay.

5. **Buku Kasir & Komisi Teknisi Otomatis**
   - Rekap komisi montir transparan berdasarkan persentase bagi hasil jasa (tanpa error NaN / Rp 0).
   - Cetak Invoice PDF siap pakai (`window.print` dengan optimasi `@media print`).
   - Perhitungan estimasi laba bersih operasional bengkel (Omzet - Bahan Poles - Komisi).

6. **Arsitektur Dual-Mode**
   - **Interactive Mock Sandbox Mode**: Berjalan 100% out-of-the-box tanpa konfigurasi tambahan (dengan data demo realistis tersimpan di LocalStorage).
   - **Live Supabase Mode**: Terhubung langsung ke database cloud PostgreSQL Supabase secara instan saat kredensial diaktifkan.

---

## 🚀 Panduan Menjalankan Project

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Mode Development
```bash
npm run dev
```

### 3. Build untuk Production
```bash
npm run build
```

---

## 🔒 Konfigurasi Environment (`.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME="NAIRISTEM Workshop"
VITE_WORKSHOP_NAME="NAIRISTEM Detailing Lab"
VITE_WORKSHOP_PHONE="081299998888"
VITE_WORKSHOP_ADDRESS="Jl. Otista Raya No. 88, Jakarta Timur"
```

---

## 📄 License & Brand
Developed by **NAIRISTEM** (Software Agency & Digital Solutions).
