# Sistem E-Surat Yayasan PISSYA

Sistem E-Surat Yayasan PISSYA adalah aplikasi berbasis web yang dikembangkan untuk mendigitalisasi alur persetujuan, penomoran otomatis, penandatanganan elektronik, serta pengarsipan surat di lingkungan Yayasan Pondok Pesantren Islamiyah Syafi'iyah (PISSYA).

Aplikasi ini dibangun menggunakan framework **Laravel** untuk backend, **React** dengan **TypeScript** untuk frontend, **Vite** sebagai asset bundler, dan **TailwindCSS** untuk styling.

---

## Prasyarat (Prerequisites)

Sebelum memulai instalasi, pastikan sistem Anda sudah terpasang:
*   [PHP >= 8.2](https://www.php.net/)
*   [Composer](https://getcomposer.org/)
*   [Node.js (LTS recommended) & npm](https://nodejs.org/)
*   Database Server (MySQL / MariaDB / PostgreSQL)
*   [Git](https://git-scm.com/)

---

## Langkah Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di lingkungan lokal Anda:

### 1. Clone Repositori
Clone proyek ini ke komputer lokal Anda dengan menjalankan perintah berikut:
```bash
git clone https://github.com/ahnafzaki12/E-Surat.git
cd E-Surat
```

### 2. Instalasi Dependensi Backend (Composer)
Pasang semua pustaka/packages PHP yang dibutuhkan menggunakan Composer:
```bash
composer install
```

### 3. Instalasi Dependensi Frontend (NPM)
Pasang semua package Javascript yang dibutuhkan menggunakan npm:
```bash
npm install
```

### 4. Konfigurasi Environment File
Salin file konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka file `.env` yang baru dibuat dan sesuaikan konfigurasi database Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database_anda
DB_USERNAME=username_database_anda
DB_PASSWORD=password_database_anda
```

### 5. Generate Application Key
Generate key enkripsi unik untuk Laravel:
```bash
php artisan key:generate
```

### 6. Jalankan Migrasi & Seeder Database
Buat tabel-tabel di database beserta data awal (seeders) seperti role, user, dan jenis surat:
```bash
php artisan migrate --seed
```

### 7. Jalankan Link Storage (Opsional/Rekomendasi)
Agar file surat (PDF) dan tanda tangan yang diupload dapat diakses secara publik oleh aplikasi, jalankan:
```bash
php artisan storage:link
```

---

## Menjalankan Aplikasi

Untuk menjalankan aplikasi secara lokal, Anda perlu menjalankan server backend Laravel dan server dev frontend (Vite) secara bersamaan:

### Server Backend (Laravel)
Jalankan server pengembangan Laravel:
```bash
php artisan serve
```
Secara default, backend akan berjalan di [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Server Frontend (Vite)
Buka terminal baru di direktori proyek yang sama, lalu jalankan server Vite:
```bash
npm run dev
```

Sekarang Anda dapat membuka aplikasi E-Surat melalui browser Anda di alamat [http://127.0.0.1:8000](http://127.0.0.1:8000).
