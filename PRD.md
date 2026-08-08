# Product Requirements Document (PRD)
# Sistem E-Surat Yayasan PISSYA

| | |
|---|---|
| **Nama Produk** | Sistem E-Surat Yayasan PISSYA |
| **Versi Dokumen** | 1.0 |
| **Konteks** | Program Kerja KKN — Pondok Pesantren Islamiyah Syafi'iyah, Paiton, Probolinggo |
| **Disusun oleh** | Tim KKN |
| **Status** | Draft untuk review |

---

## 1. Latar Belakang

Yayasan PISSYA saat ini menerbitkan surat resmi secara manual, mulai dari penyusunan, penomoran, hingga penandatanganan oleh Ketua Yayasan (Gus). Proses ini rawan terhadap keterlambatan approval (karena Gus tidak selalu di tempat), nomor surat ganda/salah urut, serta sulitnya verifikasi keaslian surat oleh pihak eksternal.

Sistem E-Surat dikembangkan untuk mendigitalisasi **alur persetujuan dan penandatanganan** surat, tanpa mengubah cara surat itu sendiri disusun (tetap dibuat manual oleh sekretaris menggunakan Word), sehingga adopsi lebih mudah dan risiko perubahan proses kerja diminimalkan.

## 2. Tujuan Produk

1. Mempercepat proses persetujuan surat oleh Gus, termasuk dari perangkat mobile.
2. Menjamin nomor surat selalu sesuai *Petunjuk Penomoran Surat Yayasan PISSYA* (unik, berurutan, tidak bentrok).
3. Menyediakan tanda tangan elektronik otomatis yang tertaut ke surat yang telah disetujui.
4. Menyediakan mekanisme verifikasi keaslian surat oleh pihak eksternal melalui QR code.
5. Membentuk arsip digital surat keluar yang terpusat dan mudah ditelusuri.

## 3. Ruang Lingkup

### 3.1 Termasuk (In-Scope)
- Manajemen user & role (Sekretaris, Approver/Gus, Admin).
- Upload draft surat (PDF) beserta metadata.
- Alur approval (setuju/tolak + catatan).
- Penomoran surat otomatis saat surat disetujui.
- Pembubuhan tanda tangan elektronik (gambar TTD) + QR code verifikasi ke file PDF.
- Halaman verifikasi publik (tanpa login).
- Arsip & pencarian surat berdasarkan jenis, status, tanggal, pembuat.
- Log/riwayat approval (audit trail).

### 3.2 Tidak Termasuk (Out-of-Scope) — Fase Ini
- Penyusunan/editing isi surat di dalam sistem (tetap dibuat manual di Word oleh sekretaris).
- Integrasi sertifikat elektronik resmi BSrE/BSSN (dicatat sebagai potensi pengembangan lanjutan).
- Notifikasi WhatsApp/Telegram (opsional, dapat ditambahkan jika waktu memungkinkan).
- Multi-level approval berjenjang (saat ini hanya satu approver: Gus).

## 4. Aktor & Role

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Sekretaris** | Menyusun surat di luar sistem, mengunggah draft, mengajukan approval | Create surat, lihat status surat miliknya, download surat final |
| **Approver (Gus/Ketua Yayasan)** | Meninjau dan menyetujui/menolak surat | Lihat semua surat masuk, approve/reject, riwayat surat yang sudah ditandatangani |
| **Admin** | Mengelola sistem | CRUD user, CRUD jenis surat, reset counter nomor, monitoring seluruh surat |
| **Publik** (non-user) | Pihak eksternal penerima surat | Akses halaman verifikasi via QR code (read-only, tanpa login) |

Struktur ini mengacu pada tabel `roles` di ERD, di mana setiap `user` terhubung ke satu `role`.

## 5. Entity Relationship Diagram (ERD)

Diagram berikut menjadi acuan struktur data sistem:

```
roles (1) ──── (N) users
users (1) ──── (N) surats            [via created_by & approved_by]
users (1) ──── (N) approval_logs     [via user_id]
users (1) ──── (N) signatures        [via user_id]
surats (1) ──── (N) approval_logs    [via surat_id]
surats (N) ──── (1) jenis_surats     [via jenis_surat_id]
surats (N) ──── (1) nomor_surats     [via nomor_surat_id]
jenis_surats (1) ──── (N) nomor_surats [via jenis_surat_id]
```

### 5.1 Deskripsi Entitas & Field

**`roles`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| name | string | sekretaris / approver / admin |
| description | text | Deskripsi role |

**`users`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| role_id | FK → roles | |
| name | string | |
| email | string, unique | Digunakan untuk login |
| password | string (hashed) | |
| phone | string (opsional) | Untuk notifikasi |
| status | enum | aktif / nonaktif |
| created_at / updated_at | timestamp | |

**`jenis_surats`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| kode | string | A.1, A.2, ..., B.1, B.2 (lihat Bab III panduan penomoran) |
| nama | string | Surat Tugas, Surat Undangan, dst. |
| kategori | enum | umum (A) / khusus (B) |
| pakai_bulan_romawi | boolean | `true` untuk semua kecuali B.1 (Surat Keputusan) |
| deskripsi | text | |

**`nomor_surats`** *(counter tahunan per jenis surat)*
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats | |
| tahun | integer | Tahun berjalan |
| last_number | integer | Nomor urut terakhir yang dipakai, direset tiap 1 Januari |
| updated_at | timestamp | |

> Kombinasi `jenis_surat_id + tahun` bersifat unik (satu counter per jenis surat per tahun).

**`surats`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats | |
| nomor_surat_id | FK → nomor_surats, **nullable** | Terisi hanya setelah disetujui |
| nomor_surat_formatted | string, nullable | Hasil format lengkap, mis. `A.2-59/YA-PISSYA/VII/2026` |
| perihal | string | |
| tujuan_surat | text | Kepada siapa surat ditujukan |
| tanggal_surat | date | |
| file_draft | string (path) | PDF asli dari sekretaris |
| file_final | string (path), nullable | PDF setelah dibubuhi TTD + QR |
| status | enum | draft / menunggu_persetujuan / ditolak / disetujui |
| catatan_penolakan | text, nullable | |
| created_by | FK → users | Sekretaris pengunggah |
| approved_by | FK → users, nullable | Approver yang menyetujui |
| approved_at | timestamp, nullable | |
| created_at / updated_at | timestamp | |

**`approval_logs`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats | |
| user_id | FK → users | Siapa yang melakukan aksi |
| aksi | enum | diajukan / disetujui / ditolak |
| catatan | text, nullable | |
| created_at | timestamp | |

**`signatures`**
| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| user_id | FK → users | Pemilik tanda tangan (approver) |
| image_path | string | File gambar TTD |
| type | enum | gambar / qr_only / sertifikat_elektronik (future) |
| is_active | boolean | TTD aktif yang dipakai saat ini |
| created_at | timestamp | |

## 6. Functional Requirements & User Stories

### 6.1 Modul Autentikasi & User Management
- **FR-01**: Sistem harus menyediakan login berbasis email & password dengan role-based access.
- **FR-02**: Admin dapat membuat, mengedit, menonaktifkan akun user beserta role-nya.
- *User Story*: "Sebagai Admin, saya ingin mengelola akun sekretaris dan approver agar hanya pihak berwenang yang bisa mengakses sistem."

### 6.2 Modul Master Data
- **FR-03**: Admin dapat mengelola daftar `jenis_surats` (kode, nama, kategori, aturan bulan romawi).
- **FR-04**: Admin dapat mengelola/mereset `nomor_surats` (mis. jika terjadi kesalahan tahunan).

### 6.3 Modul Pengajuan Surat (Sekretaris)
- **FR-05**: Sekretaris dapat mengunggah file PDF draft surat beserta metadata (jenis surat, perihal, tujuan, tanggal surat).
- **FR-06**: Sistem menyimpan surat dengan status awal `menunggu_persetujuan`.
- **FR-07**: Sekretaris dapat melihat daftar & status surat yang pernah diajukan.
- **FR-08**: Sekretaris menerima notifikasi saat surat disetujui/ditolak.
- *User Story*: "Sebagai Sekretaris, saya ingin mengunggah draft surat dan langsung tahu statusnya, agar tidak perlu bolak-balik menanyakan ke Gus."

### 6.4 Modul Approval (Gus/Approver)
- **FR-09**: Approver dapat melihat daftar surat berstatus `menunggu_persetujuan`.
- **FR-10**: Approver dapat membuka preview PDF langsung di browser sebelum memutuskan.
- **FR-11**: Approver dapat **menolak** surat dengan mengisi catatan alasan → status berubah `ditolak`, sekretaris dapat mengunggah revisi.
- **FR-12**: Approver dapat **menyetujui** surat →
  - Sistem generate nomor surat otomatis dari `nomor_surats` (increment `last_number`, format sesuai `jenis_surats`).
  - Sistem membubuhkan gambar tanda tangan approver, nomor surat, dan QR code verifikasi ke PDF → disimpan sebagai `file_final`.
  - Status berubah `disetujui`, `approved_by` dan `approved_at` terisi.
- **FR-13**: Setiap aksi approval (ajukan/setuju/tolak) tercatat di `approval_logs`.
- *User Story*: "Sebagai Gus, saya ingin bisa menyetujui surat dari HP kapan saja, tanpa harus hadir langsung ke kantor yayasan."

### 6.5 Modul Penomoran Otomatis
- **FR-14**: Penomoran **hanya** terjadi pada saat approval, bukan saat upload (sesuai aturan: surat belum boleh diberi nomor sebelum ditandatangani).
- **FR-15**: Format nomor mengikuti aturan:
  - Surat umum (A): `[Kode].[Nomor Urut]/YA-PISSYA/[Bulan Romawi]/[Tahun]`
  - Surat Keputusan (B.1): `B.1-[Nomor Urut]/YA-PISSYA/[Tahun]` (tanpa bulan)
- **FR-16**: Nomor urut reset otomatis ke 1 setiap pergantian tahun kalender, per jenis surat.
- **FR-17**: Sistem mencegah nomor ganda melalui locking/transaction saat increment counter.

### 6.6 Modul Tanda Tangan Elektronik
- **FR-18**: Sistem menyimpan gambar tanda tangan approver di tabel `signatures`.
- **FR-19**: Saat approval, sistem menempelkan gambar TTD aktif + QR code + nomor surat ke posisi yang sesuai pada PDF.
- **FR-20**: QR code mengarah ke URL unik halaman verifikasi surat tersebut.

### 6.7 Modul Verifikasi Publik
- **FR-21**: Halaman verifikasi (tanpa login) menampilkan: status dokumen (AKTIF), nomor surat, jenis/keterangan, nama penandatangan, waktu tanda tangan, dan tombol download — mengikuti tampilan pada contoh referensi (Gambar 2).
- **FR-22**: Jika nomor surat tidak ditemukan atau surat berstatus tidak valid, sistem menampilkan pesan "dokumen tidak ditemukan/tidak valid".

### 6.8 Modul Arsip & Pencarian
- **FR-23**: User dapat mencari surat berdasarkan nomor, jenis, status, rentang tanggal, dan pembuat.
- **FR-24**: User dapat mengunduh `file_final` dari surat yang telah disetujui.

## 7. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| Keamanan | Password di-hash, role-based access control, validasi tipe & ukuran file upload (PDF only) |
| Audit | Semua aksi approval tercatat dengan timestamp dan user_id (tidak bisa dihapus/diedit) |
| Ketersediaan | Sistem dapat diakses dari mobile browser (responsive), khususnya untuk approver |
| Performa | Proses stempel PDF (TTD+QR+nomor) selesai dalam hitungan detik saat approval |
| Kompatibilitas | PDF hasil akhir dapat dibuka di viewer PDF standar tanpa font/layout rusak |
| Skalabilitas | Struktur `nomor_surats` per tahun-per jenis memungkinkan penambahan jenis surat baru tanpa migrasi besar |

## 8. Alur Proses Utama (Business Flow)

```
Sekretaris login → Upload draft PDF + metadata → status: menunggu_persetujuan
        ↓
Gus login → Lihat daftar surat masuk → Preview PDF
        ↓
   ┌────┴────┐
 Tolak      Setuju
   │           │
   │      Generate nomor_surat (increment nomor_surats.last_number)
   │      Tempel TTD + QR + nomor → simpan file_final
   │      status: disetujui, approved_by & approved_at terisi
   │      Catat di approval_logs
   │           │
   ▼           ▼
Sekretaris   Sekretaris & pihak terkait bisa download file_final
revisi &            │
upload ulang        ▼
             Publik scan QR → halaman verifikasi publik
```

## 9. Aturan Bisnis Kunci (Business Rules)

1. Nomor surat **tidak pernah** diberikan sebelum surat disetujui approver.
2. Satu kombinasi `jenis_surat_id + tahun` hanya memiliki satu counter (`nomor_surats`), tidak boleh duplikat.
3. Surat Keputusan (B.1) memakai format tanpa bulan romawi dan counter terpisah dari surat umum.
4. Setelah surat berstatus `disetujui`, `file_final` tidak dapat diubah/diedit — jika ada revisi harus melalui surat baru.
5. Setiap perubahan status surat wajib meninggalkan jejak di `approval_logs`.

## 10. Asumsi & Batasan

- Isi/redaksi surat sepenuhnya tanggung jawab sekretaris; sistem tidak memvalidasi isi surat, hanya memvalidasi metadata & format file.
- Tanda tangan elektronik pada fase ini berupa **gambar TTD + QR verifikasi internal**, bukan sertifikat elektronik tersertifikasi BSrE/BSSN (potensi pengembangan lanjutan di luar cakupan KKN).
- Sistem diasumsikan digunakan dalam jaringan/hosting milik yayasan dengan jumlah user terbatas (skala kecil-menengah).

## 11. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Sekretaris dapat mengunggah surat dan melihat status real-time.
- [ ] Gus dapat menyetujui/menolak surat dari perangkat mobile.
- [ ] Nomor surat yang dihasilkan sistem 100% sesuai format panduan penomoran PISSYA, tanpa duplikasi, untuk minimal 2 jenis surat berbeda (A dan B) yang diuji dalam 1 tahun yang sama.
- [ ] PDF final memiliki TTD, nomor surat, dan QR code yang dapat dipindai dan mengarah ke halaman verifikasi yang benar.
- [ ] Halaman verifikasi publik dapat diakses tanpa login dan menampilkan data sesuai surat yang bersangkutan.
- [ ] Semua aksi approval tercatat lengkap di `approval_logs` dan dapat ditelusuri oleh Admin.

## 12. Glosarium

| Istilah | Arti |
|---|---|
| TTE | Tanda Tangan Elektronik |
| PISSYA | Pondok Pesantren Islamiyah Syafi'iyah |
| Approver | Pihak yang berwenang menyetujui & menandatangani surat (Gus/Ketua Yayasan) |
| Counter tahunan | Mekanisme nomor urut yang direset tiap tahun per jenis surat |