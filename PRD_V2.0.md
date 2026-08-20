# Product Requirements Document (PRD)
# Sistem E-Surat Yayasan PISSYA

| | |
|---|---|
| **Nama Produk** | Sistem E-Surat Yayasan PISSYA |
| **Versi Dokumen** | 2.0 |
| **Konteks** | Program Kerja KKN — Pondok Pesantren Islamiyah Syafi'iyah, Paiton, Probolinggo |
| **Disusun oleh** | Tim KKN |
| **Status** | Final |
| **Stack Teknologi** | Laravel 12 · Inertia.js · React (TypeScript) · SQLite · FPDI · endroid/qr-code |

---

# 1. Latar Belakang

Yayasan PISSYA menerbitkan surat resmi secara manual — mulai dari penyusunan, penomoran, hingga persetujuan Ketua Yayasan (Gus). Proses manual ini rawan terhadap keterlambatan approval, penomoran ganda, dan sulitnya verifikasi keaslian surat oleh pihak eksternal.

Sistem E-Surat dikembangkan untuk mendigitalisasi **alur pengajuan, persetujuan, penomoran, dan verifikasi surat**. Surat tetap disusun secara manual menggunakan Microsoft Word kemudian dikonversi ke PDF dan diunggah ke sistem.

Sistem tidak membubuhkan gambar tanda tangan ke PDF. Sebagai gantinya, setelah surat disetujui oleh Approver (Gus), sistem membubuhkan **TTE Badge** — kartu digital berisi QR Code unik dan metadata — ke dalam PDF. QR Code mengarah ke halaman verifikasi publik.

---

# 2. Tujuan Produk

1. Mempercepat proses persetujuan surat oleh Gus, termasuk dari perangkat mobile.
2. Menjamin nomor surat selalu sesuai *Petunjuk Penomoran Surat Yayasan PISSYA*.
3. Menjamin setiap surat yang disetujui memiliki nomor surat unik dan berurutan.
4. Menyediakan QR Code unik yang tertaut dengan surat yang telah disetujui.
5. Menyediakan mekanisme verifikasi keaslian surat oleh pihak eksternal tanpa login.
6. Memungkinkan penempatan TTE Badge secara fleksibel melalui PDF Placement Editor.
7. Membentuk arsip digital surat keluar yang terpusat.
8. Membentuk audit trail untuk setiap aksi pengajuan, persetujuan, dan penolakan.
9. Mengirimkan notifikasi email otomatis kepada pihak terkait pada setiap perubahan status surat.

---

# 3. Ruang Lingkup

## 3.1 Termasuk (In-Scope)

- Login berbasis email dan password (session-based).
- Role-based access control: `sekretaris` dan `approver`.
- Manajemen user (CRUD) dengan binding ke Lembaga.
- Manajemen Lembaga (CRUD).
- Manajemen jenis surat (CRUD) beserta posisi default TTE Badge per jenis surat.
- Manajemen counter nomor surat (CRUD + reset).
- Upload PDF draft surat (max 10 MB).
- Input metadata surat: jenis surat, perihal, tanggal surat.
- PDF Placement Editor berbasis visual (React + react-pdf-viewer) — drag & drop, resize TTE Badge.
- Penyimpanan konfigurasi posisi TTE Badge dalam koordinat relatif (top-left, 0–1).
- Alur approval satu level: Sekretaris → Approver (Gus).
- Approval: setuju (generate nomor + QR + stamp PDF + hash) atau tolak (dengan catatan).
- Penomoran otomatis saat approval: counter per jenis surat per tahun, dengan locking transaksi.
- Generate TTE Badge dinamis (PNG) via GD Library: QR Code + nama approver + tanggal & waktu + URL verifikasi.
- Stamping TTE Badge ke PDF menggunakan FPDI.
- Hashing SHA-256 PDF final.
- Halaman verifikasi publik (tanpa login) melalui token unik.
- Download PDF final melalui token verifikasi (publik).
- Preview PDF (streaming, protected).
- Audit trail (`approval_logs`): aksi diajukan / disetujui / ditolak.
- Notifikasi email: diajukan → Approver; disetujui → Sekretaris; ditolak → Sekretaris.
- Dashboard statistik: jumlah surat per status.
- Filter tampilan surat berdasarkan role user.

## 3.2 Tidak Termasuk (Out-of-Scope)

- Penyusunan atau editing isi surat di dalam sistem.
- Tanda tangan elektronik berbasis gambar scan basah.
- Tanda tangan elektronik tersertifikasi (BSrE/BSSN/PSrE).
- Notifikasi WhatsApp/Telegram.
- OCR deteksi area posisi surat otomatis.

---

# 4. Aktor & Role

| Role (`roles.name`) | Deskripsi | Hak Akses Utama |
|---|---|---|
| **sekretaris** | Pengguna yang membuat dan mengajukan surat. Sekretaris Yayasan (`lemb_name = 'Yayasan'`) dapat melihat seluruh surat; Sekretaris Lembaga hanya melihat surat miliknya. | Create surat, upload PDF, set posisi QR, submit surat |
| **approver** | Gus / Ketua Yayasan. Menyetujui atau menolak surat. | Lihat semua surat pending/disetujui/ditolak, preview PDF, approve/reject |
| **admin** | Mengelola data master sistem. | CRUD user, role, jenis surat, lembaga, counter nomor surat |
| **Publik** | Pihak eksternal penerima surat. | Akses halaman verifikasi `/verify/{token}` tanpa login |

---

# 5. Skema Database

## 5.1 `roles`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK bigint unsigned | |
| name | string | `sekretaris` / `approver` |
| description | text, nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5.2 `lembagas`

| Field | Tipe | Keterangan |
|---|---|---|
| lemb_id | PK bigint unsigned | |
| lemb_name | string | Nama Lembaga; nilai `'Yayasan'` menandai Sekretaris Yayasan |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5.3 `users`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK bigint unsigned | |
| role_id | FK → roles.id | |
| lemb_id | FK → lembagas.lemb_id, nullable | Binding ke Lembaga; `null` untuk user tanpa Lembaga |
| name | string | |
| email | string, unique | Digunakan untuk login |
| email_verified_at | timestamp, nullable | |
| password | string | Hashed (bcrypt) |
| phone | string, nullable | |
| status | enum(`aktif`, `nonaktif`) | Default: `aktif` |
| remember_token | string, nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5.4 `jenis_surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| kode | string | Contoh: A.1, A.2, B.1 |
| nama | string | Contoh: Surat Tugas, Surat Undangan |
| kategori | enum(`umum`, `khusus`) | |
| pakai_bulan_romawi | boolean | Apakah bulan menggunakan angka Romawi dalam nomor surat |
| deskripsi | text, nullable | |
| qr_position_default | json, nullable | Posisi default TTE Badge per jenis surat |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5.5 `nomor_surats`

Counter nomor surat per jenis surat per tahun. Berlaku terpusat di level Yayasan.

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats.id | |
| tahun | integer | Tahun berjalan |
| last_number | integer | Nomor urut terakhir yang digunakan |
| updated_at | timestamp | |

```sql
UNIQUE (jenis_surat_id, tahun)
```

---

## 5.6 `surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats.id | |
| nomor_surat_id | FK → nomor_surats.id, nullable | Diisi setelah approval |
| nomor_surat_formatted | string, nullable | Nomor surat lengkap dalam format teks |
| perihal | string | |
| tujuan_surat | text | Diisi otomatis dari `lembaga.lemb_name` user pembuat |
| tanggal_surat | date | |
| file_draft | json | Path & metadata PDF draft |
| file_final | json, nullable | Path & metadata PDF final |
| qr_position | json, nullable | Posisi TTE Badge — koordinat relatif top-left (0–1) |
| verification_token | string, unique, nullable | Token 48 karakter random |
| file_hash | string, nullable | SHA-256 hash PDF final |
| status | enum | `draft` / `menunggu_persetujuan` / `ditolak` / `disetujui` |
| catatan_penolakan | text, nullable | |
| created_by | FK → users.id | Sekretaris yang mengajukan |
| approved_by | FK → users.id, nullable | Approver yang bertindak (setuju atau tolak) |
| approved_at | timestamp, nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 5.7 `approval_logs`

Audit trail immutable — hanya insert, tidak ada `updated_at`.

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats.id | |
| user_id | FK → users.id | Pelaku aksi |
| aksi | enum(`diajukan`, `disetujui`, `ditolak`) | |
| catatan | text, nullable | |
| created_at | timestamp | |

---

## 5.8 Struktur `qr_position` (JSON)

Field `qr_position` dan `qr_position_default` menyimpan posisi TTE Badge menggunakan koordinat relatif terhadap dimensi halaman PDF dengan titik acuan **kiri-atas (top-left)**.

```json
{
    "page": 1,
    "x": 0.72,
    "y": 0.78,
    "width": 0.26,
    "height": 0.10
}
```

| Field | Keterangan |
|---|---|
| `page` | Nomor halaman PDF (1-based) |
| `x` | Posisi horizontal relatif (0–1) dari tepi kiri halaman |
| `y` | Posisi vertikal relatif (0–1) dari tepi atas halaman |
| `width` | Lebar TTE Badge relatif terhadap lebar halaman |
| `height` | Tinggi TTE Badge relatif terhadap tinggi halaman |

---

# 6. Entity Relationship Diagram

```text
roles (1) ──── (N) users
lembagas (1) ──── (N) users          [via lemb_id]

users (1) ──── (N) surats            [via created_by]
users (1) ──── (N) surats            [via approved_by]
surats (N) ──── (1) jenis_surats
surats (N) ──── (1) nomor_surats     [nullable, diisi saat approval]
surats (1) ──── (N) approval_logs
users (1) ──── (N) approval_logs
```

---

# 7. Functional Requirements

## 7.1 Modul Autentikasi

### FR-01
Sistem menyediakan halaman login dengan input email dan password.

### FR-02
Sistem menerapkan session-based authentication via Laravel Auth.

### FR-03
Sistem menerapkan role-based access control berbasis `role_id` pada tabel `users`.

### FR-04
Halaman login hanya dapat diakses oleh tamu (guest). User yang sudah login diarahkan ke dashboard.

### FR-05
Logout tersedia dan menghapus session aktif.

---

## 7.2 Modul Master Data

### FR-06 — Manajemen Lembaga
Admin dapat membuat, mengedit, dan menghapus data Lembaga (`lemb_name`).

### FR-07 — Manajemen User
Admin dapat membuat, mengedit, dan menghapus akun user, termasuk memilih role dan Lembaga terkait.

Validasi:
- `name`, `email` (unik), `password` (min 8 karakter), `role_id` — wajib.
- `lemb_id` — opsional (nullable).

### FR-08 — Manajemen Role
Admin dapat membuat, mengedit, dan menghapus role.

### FR-09 — Manajemen Jenis Surat
Admin dapat membuat, mengedit, dan menghapus jenis surat, termasuk mengatur `qr_position_default`.

### FR-10 — Manajemen Counter Nomor Surat
Admin dapat mengelola atau mereset counter nomor surat per jenis surat per tahun.

---

## 7.3 Modul Pengajuan Surat

### FR-11 — Pembuatan Surat Baru
Sekretaris mengunggah PDF draft dengan metadata:
- `jenis_surat_id` (wajib)
- `perihal` (wajib)
- `tanggal_surat` (wajib)
- `file_draft` — file PDF, max 10 MB (wajib)
- `qr_position` — posisi TTE Badge (opsional, dapat diatur via Placement Editor)

Field `tujuan_surat` diisi **otomatis** dari `lembaga.lemb_name` user yang membuat surat.

### FR-12 — Status Awal Surat
Surat yang disimpan melalui form pembuatan langsung berstatus `menunggu_persetujuan` dan mencatat aksi `diajukan` ke `approval_logs`.

### FR-13 — Submit Surat (dari draft/ditolak)
Sekretaris dapat mengajukan kembali surat berstatus `draft` atau `ditolak` menjadi `menunggu_persetujuan` melalui action submit.

### FR-14 — Notifikasi Email saat Pengajuan
Saat surat diajukan, sistem mengirimkan email notifikasi ke **semua** user dengan role `approver`.

### FR-15 — Daftar Surat Berdasarkan Role

| Role | Surat yang Terlihat |
|---|---|
| Sekretaris Lembaga | Hanya surat miliknya (`created_by = user.id`) |
| Sekretaris Yayasan (`lemb_name = 'Yayasan'`) | Semua surat dari semua Lembaga |
| Approver | Surat berstatus `menunggu_persetujuan`, `disetujui`, `ditolak` |

### FR-16 — Detail Surat
`GET /surat/{id}` mengembalikan JSON berisi data surat beserta URL preview PDF, sesuai hak akses user.

---

## 7.4 Modul PDF Placement Editor

### FR-17
Sistem menyediakan PDF Placement Editor berbasis visual (React + react-pdf-viewer) untuk menentukan posisi TTE Badge pada PDF.

### FR-18
Sekretaris dapat memilih halaman PDF tempat TTE Badge akan ditempatkan.

### FR-19
Sekretaris dapat melakukan drag-and-drop dan resize pada spesimen TTE Badge di atas kanvas PDF. Aspect ratio TTE Badge terkunci selama resize.

### FR-20 — Tampilan Spesimen TTE Badge

```text
┌─────────────────────────────────────┐
│  ┌───────┐  TTE oleh :              │
│  │  QR   │  [NAMA APPROVER]         │
│  │ CODE  │  [Tanggal & Waktu] WIB   │
│  └───────┘  Verifikasi melalui      │
│             [URL Web]               │
└─────────────────────────────────────┘
```

### FR-21
Posisi TTE Badge disimpan dalam koordinat relatif (0–1) terhadap dimensi halaman PDF, dengan titik acuan **kiri-atas (top-left)**.

### FR-22
Sistem menggunakan `qr_position_default` dari jenis surat sebagai posisi awal pada Placement Editor.

### FR-23
Sekretaris dapat mengubah posisi selama status surat masih `draft` atau `ditolak`.

### FR-24
Posisi TTE Badge tidak dapat diubah setelah surat berstatus `menunggu_persetujuan` atau `disetujui`.

---

## 7.5 Modul Approval

### FR-25 — Hak Approve
Hanya user dengan role `approver` yang dapat melakukan aksi approve. Akses ditolak (HTTP 403) jika role tidak sesuai.

### FR-26 — Preview PDF
Approver dapat membuka preview PDF sebelum memberikan keputusan.

### FR-27 — Setujui Surat
Saat Approver menyetujui surat, sistem melakukan proses berikut dalam satu DB transaction:

1. Locking counter nomor surat (`SELECT ... FOR UPDATE`).
2. Membuat atau memperbarui counter `nomor_surats` untuk kombinasi `(jenis_surat_id, tahun)`.
3. Increment `last_number` → generate `nomor_surat_formatted`.
4. Membuat `verification_token` (48 karakter random via `Str::random(48)`).
5. Menyimpan token, nomor surat, `approved_by`, `approved_at` ke record surat.
6. Memanggil `FinalSuratPdfService`:
   - Generate QR Code PNG (endroid/qr-code, 500×500 px, margin 12).
   - Generate TTE Badge PNG via GD Library (QR + metadata approver).
   - Stamp TTE Badge ke PDF via FPDI (koordinat top-left dikonversi ke koordinat absolut PDF).
   - Simpan PDF final ke `storage/private/finals/{year}/{token}.pdf`.
7. Hitung SHA-256 dari PDF final.
8. Update surat: `file_final`, `file_hash`, `status = disetujui`.
9. Catat ke `approval_logs` (aksi: `disetujui`).
10. Kirim email notifikasi ke Sekretaris pembuat.

### FR-28 — Tolak Surat
Saat Approver menolak surat:
1. Update surat: `status = ditolak`, `catatan_penolakan`, `approved_by`, `approved_at`.
2. Catat ke `approval_logs` (aksi: `ditolak`).
3. Kirim email notifikasi ke Sekretaris pembuat.

Sekretaris dapat melakukan revisi dan submit ulang.

### FR-29 — Error Handling Approval
Jika proses generate PDF final gagal, transaksi di-rollback dan sistem menampilkan pesan error. Status surat tidak berubah.

---

## 7.6 Modul QR Code & TTE Badge

### FR-30 — Generate QR Code
QR Code berisi URL penuh halaman verifikasi:
```text
https://[domain]/verify/{verification_token}
```

### FR-31 — Generate TTE Badge
TTE Badge dibuat secara dinamis sebagai gambar PNG menggunakan GD Library dengan konten:
- Label "TTE oleh :"
- Nama Approver (huruf kapital, format ASCII)
- Tanggal & waktu approval (`dd MMMM YYYY HH:mm:ss WIB`)
- Label "Verifikasi melalui" + URL pendek (scheme + host)
- Font: Open Sans TTF dari package endroid/qr-code.

### FR-32 — Stamping ke PDF
FPDI meng-import semua halaman PDF draft, kemudian menambahkan gambar TTE Badge ke halaman yang ditentukan. Koordinat relatif top-left dikonversi ke koordinat absolut PDF sesuai dimensi halaman aktual.

### FR-33 — Immutabilitas
PDF final tidak dapat diubah setelah tersimpan. File sementara (QR PNG, badge PNG) di `storage/private/temporary/` dihapus otomatis setelah proses selesai.

---

## 7.7 Modul Verifikasi Publik

### FR-34 — Halaman Verifikasi
Dapat diakses tanpa login melalui URL dari QR Code:
```text
GET /verify/{token}
```
Menampilkan: nomor surat, perihal, tujuan surat, jenis surat, nama approver, tanggal approval, SHA-256 hash.

### FR-35 — Download PDF Final
PDF final dapat diunduh tanpa login melalui:
```text
GET /verify/{token}/download
```
Token berfungsi sebagai otorisasi akses.

### FR-36 — Pemeriksaan Integritas
SHA-256 PDF final ditampilkan pada halaman verifikasi sehingga pihak eksternal dapat memverifikasi integritas dokumen secara mandiri.

### FR-37 — Token Tidak Valid
Jika token tidak ditemukan atau surat tidak berstatus `disetujui`, sistem mengembalikan HTTP 404.

---

## 7.8 Modul Dashboard

### FR-38 — Statistik Surat
Dashboard menampilkan jumlah surat per status: disetujui, menunggu persetujuan, draft, ditolak.

---

# 8. Alur Utama Sistem

## 8.1 Alur Pembuatan & Persetujuan Surat

```text
Sekretaris Login
       │
       ▼
Upload PDF Draft → Isi Metadata (jenis, perihal, tanggal)
       │
       ▼
PDF Placement Editor → Drag & Drop posisi TTE Badge → Simpan Posisi
       │
       ▼
Submit → status: menunggu_persetujuan
       │    Email → Approver
       ▼
Approver Login → Lihat Daftar → Preview PDF
       │
   ┌───┴────┐
 Tolak    Setuju
   │         │
   ▼         ▼
status:    DB Transaction (lockForUpdate):
ditolak    ├── Increment counter → nomor_surat_formatted
   │       ├── Generate verification_token (48 char)
   │       ├── FinalSuratPdfService:
   │       │   ├── Generate QR Code PNG
   │       │   ├── Generate TTE Badge PNG (GD Library)
   │       │   └── Stamp Badge ke PDF (FPDI)
   │       ├── Hitung SHA-256
   │       ├── status → disetujui
   │       └── Catat approval_logs
   │         │
   ▼         ▼
Email →   Email →
Sekretaris Sekretaris
(Ditolak)  (Disetujui)
```

## 8.2 Alur Verifikasi Publik

```text
Pihak Eksternal Scan QR Code
       │
       ▼
GET /verify/{token}
       │
       ▼
Cari surat berdasarkan token + status = 'disetujui'
       │
       ▼
Tampilkan: nomor, perihal, jenis, approver, tanggal, hash
       │
       ▼
[Opsional] GET /verify/{token}/download → PDF Final
```

---

# 9. Proses Generate PDF Final

```text
PDF DRAFT
    │
    ▼
Generate nomor surat (locked counter)
    │
    ▼
Generate verification_token (Str::random(48))
    │
    ▼
Generate QR Code PNG ← URL /verify/{token}
    │
    ▼
Generate TTE Badge PNG (GD: QR + nama approver + waktu + URL)
    │
    ▼
Ambil qr_position dari surats (koordinat relatif top-left)
    │
    ▼
Konversi ke koordinat absolut PDF (× dimensi halaman aktual)
    │
    ▼
Import semua halaman draft via FPDI
    │
    ▼
Stamp TTE Badge ke halaman yang ditentukan
    │
    ▼
Output ke storage/private/finals/{year}/{token}.pdf
    │
    ▼
Hitung SHA-256 → simpan ke file_hash
    │
    ▼
PDF FINAL (immutable)
```

File sementara (`{token}-qr.png`, `{token}-badge.png`) dihapus otomatis via `finally` block.

---

# 10. Format Nomor Surat

### FR-39 — Format Umum (`pakai_bulan_romawi = true`)
```text
{kode}-{nomor_urut}/YA-PISSYA/{bulan_romawi}/{tahun}
```
Contoh:
```text
A.2-59/YA-PISSYA/VIII/2026
```

### FR-40 — Format SK / Surat Keputusan (`pakai_bulan_romawi = false`)
```text
{kode}-{nomor_urut}/YA-PISSYA/{tahun}
```
Contoh:
```text
B.1-12/YA-PISSYA/2026
```

### FR-41 — Atomisitas Counter
DB transaction + `lockForUpdate()` digunakan untuk mencegah duplikasi nomor surat. Counter di-increment secara atomis.

### FR-42 — Reset Counter
Nomor urut di-reset setiap tahun melalui counter per kombinasi `jenis_surat_id + tahun`.

---

# 11. Storage

| Jenis File | Disk | Path |
|---|---|---|
| Draft PDF | `private` | `drafts/{user_id}/{timestamp}_{nama_file}` |
| Final PDF | `private` | `finals/{tahun_approval}/{token}.pdf` |
| Temporary (QR, Badge) | `private` | `temporary/{token}-qr.png`, `temporary/{token}-badge.png` |

Disk `private` tidak dapat diakses langsung via URL publik. Akses file dilakukan melalui controller (streaming/download).

---

# 12. Notifikasi Email

| Event | Mail Class | Penerima |
|---|---|---|
| Surat diajukan | `SuratDiajukanMail` | Semua user dengan role `approver` |
| Surat disetujui | `SuratDisetujuiMail` | User `created_by` (Sekretaris pembuat) |
| Surat ditolak | `SuratDitolakMail` | User `created_by` (Sekretaris pembuat) |

Mail diimplementasikan sebagai `ShouldQueue` — dikirim secara asinkron melalui queue Laravel agar tidak memblokir proses approval.

Subject email surat diajukan:
```text
"Pengajuan Surat Baru Menunggu Persetujuan: {perihal}"
```

---

# 13. Keamanan

## 13.1 Autentikasi
- Password di-hash menggunakan bcrypt.
- Session-based authentication.
- Halaman login hanya dapat diakses oleh tamu (guest middleware).

## 13.2 Otorisasi

```text
Sekretaris   → buat surat, upload PDF, set posisi QR, submit
               ❌ approve/reject surat

Approver     → approve/reject surat
               ✓ preview semua surat pending/disetujui/ditolak
               ❌ buat surat

Admin        → CRUD master data
               ❌ approve surat

Publik       → akses /verify/{token} (tanpa login)
```

User non-approver yang mencoba approve mendapat HTTP 403.
Surat yang tidak berstatus `menunggu_persetujuan` yang di-approve mendapat HTTP 404.

## 13.3 Verification Token
- 48 karakter random (`Str::random(48)`) — tidak mudah ditebak.
- Unik (constraint `UNIQUE` di database).
- Tidak mengandung ID database secara langsung.
- Tidak dapat digunakan untuk memodifikasi data surat.

## 13.4 Audit Trail

```text
diajukan   → dicatat saat surat pertama kali diajukan (store/submit)
disetujui  → dicatat saat approval berhasil
ditolak    → dicatat saat surat ditolak
```

`approval_logs` bersifat immutable — tidak ada operasi update atau delete melalui sistem.

---

# 14. Business Rules

1. Nomor surat hanya diberikan saat surat disetujui, tidak sebelumnya.
2. Satu kombinasi `(jenis_surat_id, tahun)` memiliki satu counter nomor surat.
3. Counter di-increment secara atomis dalam DB transaction dengan locking.
4. Nomor surat tidak dapat duplikat untuk jenis dan tahun yang sama.
5. Setiap surat disetujui memiliki `verification_token` unik (48 karakter).
6. Setiap surat disetujui memiliki QR Code unik yang mengarah ke URL verifikasi.
7. Sistem **tidak membubuhkan gambar tanda tangan** ke PDF — hanya TTE Badge.
8. Sistem **tidak mengklaim QR Code sebagai TTE tersertifikasi**.
9. Posisi TTE Badge ditentukan sebelum surat diajukan.
10. Posisi TTE Badge tidak dapat diubah setelah status `menunggu_persetujuan`.
11. PDF final tidak dapat dimodifikasi setelah tersimpan.
12. Jika surat ditolak, Sekretaris harus submit ulang untuk memulai proses approval kembali.
13. Email notifikasi dikirim ke semua Approver saat surat diajukan.
14. Email notifikasi dikirim ke Sekretaris pembuat saat surat disetujui atau ditolak.
15. File PDF disimpan di disk `private` — tidak dapat diakses langsung via URL publik.
16. PDF final hanya dapat diunduh melalui endpoint `/verify/{token}/download`.
17. `file_hash` menyimpan SHA-256 dari PDF final yang tersimpan.
18. Sekretaris Yayasan (`lemb_name = 'Yayasan'`) dapat melihat seluruh surat dari semua Lembaga.
19. Sekretaris Lembaga hanya dapat melihat surat yang dibuat oleh dirinya sendiri.

---

# 15. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | Password bcrypt, RBAC, validasi MIME type PDF, disk `private` |
| **Audit** | Semua aksi approval tercatat dengan timestamp dan user_id |
| **Ketersediaan** | Sistem responsive — dapat digunakan melalui mobile browser |
| **Performa** | Generate QR dan stamping PDF selesai dalam hitungan detik; queue email tidak memblokir response |
| **Kompatibilitas** | PDF final dapat dibuka pada PDF viewer standar |
| **Scalability** | Counter nomor berdasarkan tahun dan jenis surat; penambahan Lembaga tidak memerlukan migrasi skema |
| **Usability** | PDF Placement Editor intuitif dengan drag & drop |
| **Integritas** | PDF final memiliki SHA-256 hash; tersimpan di disk private |
| **Queue** | Email dikirim asinkron (ShouldQueue) agar tidak memblokir proses approval |

---

# 16. Stack Teknologi

| Layer | Teknologi |
|---|---|
| Backend Framework | Laravel 12 |
| Frontend Framework | React (TypeScript) via Inertia.js |
| CSS | TailwindCSS (via TailAdmin template) |
| Database | SQLite |
| PDF Stamping | setasign/fpdi |
| QR Code | endroid/qr-code |
| Image Processing | PHP GD Library |
| Font | Open Sans TTF (dari package endroid/qr-code) |
| Build Tool | Vite |
| Routing Frontend | Ziggy (Laravel routes di JS) |
| Auth | Laravel Session Auth |

---

# 17. Routing

| Method | URI | Controller Action | Akses |
|---|---|---|---|
| GET | `/verify/{token}` | `SuratController@verify` | Publik |
| GET | `/verify/{token}/download` | `SuratController@downloadFinal` | Publik |
| GET | `/login` | `AuthController@showLogin` | Guest only |
| POST | `/login` | `AuthController@login` | Guest only |
| POST | `/logout` | `AuthController@logout` | Auth |
| GET | `/` | Dashboard | Auth |
| GET | `/surat` | `SuratController@index` | Auth |
| GET | `/surat/create` | `SuratController@create` | Auth |
| POST | `/surat` | `SuratController@store` | Auth |
| GET | `/surat/{id}` | `SuratController@show` (JSON) | Auth |
| GET | `/surat/{id}/preview` | `SuratController@previewFile` | Auth |
| PUT | `/surat/{id}/placement` | `SuratController@updatePlacement` | Auth |
| POST | `/surat/{id}/submit` | `SuratController@submit` | Auth |
| POST | `/surat/{id}/approve` | `SuratController@approve` | Auth (approver only) |
| POST | `/surat/{id}/reject` | `SuratController@reject` | Auth |
| Resource | `/users` | `UserController` | Auth |
| Resource | `/roles` | `RoleController` | Auth |
| Resource | `/classifications` | `JenisSuratController` | Auth |
| Resource | `/stations` | `LembagaController` | Auth |

---

# 18. Status Surat

```text
DRAFT
   │
   ▼
MENUNGGU_PERSETUJUAN ←────────────────────────┐
   │                                            │
   ├── Approver menolak                         │
   │         ▼                                  │
   │      DITOLAK ── Sekretaris revisi & submit ┘
   │
   └── Approver menyetujui
             ▼
          DISETUJUI
             │
             ▼
         PDF FINAL (immutable)
             │
             ▼
           ARSIP
```

---

# 19. Halaman Verifikasi Publik

```text
╔══════════════════════════════════════╗
║       ✓ DOKUMEN TERVERIFIKASI        ║
║         Yayasan PISSYA               ║
║                                      ║
║ Nomor Surat                          ║
║ A.2-59/YA-PISSYA/VIII/2026           ║
║ Jenis Surat                          ║
║ Surat Undangan                       ║
║ Perihal                              ║
║ Undangan Kegiatan                    ║
║ Disetujui Oleh                       ║
║ GUS / KETUA YAYASAN                  ║
║ Tanggal Approval                     ║
║ 09 Agustus 2026                      ║
║ SHA-256                              ║
║ [hash string]                        ║
║                                      ║
║    [ DOWNLOAD DOKUMEN ]              ║
╚══════════════════════════════════════╝
```

---

# 20. Kriteria Penerimaan

## 20.1 Pengajuan & Approval
- [ ] Sekretaris dapat login, mengunggah PDF, mengisi metadata.
- [ ] Sekretaris dapat membuka PDF Placement Editor dan mengatur posisi TTE Badge.
- [ ] Sekretaris dapat menyimpan posisi dan mengajukan surat.
- [ ] Approver menerima email saat surat diajukan.
- [ ] Approver dapat melihat daftar surat menunggu persetujuan.
- [ ] Approver dapat membuka preview PDF sebelum memutuskan.
- [ ] Approver dapat menyetujui surat.
- [ ] Approval memulai proses generate nomor, QR, badge, stamp, hash secara atomis.
- [ ] Sekretaris menerima email saat surat disetujui.
- [ ] Approver dapat menolak surat dengan catatan.
- [ ] Sekretaris menerima email saat surat ditolak.
- [ ] Nomor surat tidak duplikat.

## 20.2 Verifikasi Publik
- [ ] QR Code dapat dipindai dan mengarah ke halaman verifikasi yang benar.
- [ ] Halaman verifikasi dapat diakses tanpa login.
- [ ] Halaman verifikasi menampilkan informasi surat yang benar.
- [ ] SHA-256 hash ditampilkan untuk verifikasi integritas.
- [ ] PDF final dapat diunduh melalui halaman verifikasi.
- [ ] Token tidak valid mengembalikan halaman error (404).

## 20.3 Master Data
- [ ] Admin dapat CRUD Lembaga.
- [ ] Admin dapat CRUD User dengan binding Lembaga.
- [ ] Admin dapat CRUD Jenis Surat dengan posisi default TTE Badge.
- [ ] Admin dapat mengelola counter nomor surat.
