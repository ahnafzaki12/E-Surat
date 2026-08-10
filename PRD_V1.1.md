# Product Requirements Document (PRD)

# Sistem E-Surat Yayasan PISSYA

| | |
|---|---|
| **Nama Produk** | Sistem E-Surat Yayasan PISSYA |
| **Versi Dokumen** | 1.1 |
| **Konteks** | Program Kerja KKN — Pondok Pesantren Islamiyah Syafi'iyah, Paiton, Probolinggo |
| **Disusun oleh** | Tim KKN |
| **Status** | Draft untuk review |

---

# 1. Latar Belakang

Yayasan PISSYA saat ini menerbitkan surat resmi secara manual, mulai dari penyusunan, penomoran, hingga proses persetujuan oleh Ketua Yayasan (Gus). Proses ini rawan terhadap keterlambatan approval karena Gus tidak selalu berada di tempat, nomor surat ganda atau salah urut, serta sulitnya verifikasi keaslian surat oleh pihak eksternal.

Sistem E-Surat dikembangkan untuk mendigitalisasi **alur pengajuan, persetujuan, penomoran, dan verifikasi surat**, tanpa mengubah cara surat itu sendiri disusun. Surat tetap dibuat secara manual oleh sekretaris menggunakan Microsoft Word kemudian dikonversi menjadi PDF.

Sistem tidak membubuhkan gambar tanda tangan atau tanda tangan elektronik berbasis sertifikat pada PDF pada fase ini. Sebagai gantinya, setelah surat disetujui oleh approver, sistem membubuhkan **QR Code unik** ke dalam PDF yang mengarah ke halaman verifikasi publik.

Untuk mengakomodasi perbedaan layout setiap surat, posisi QR Code tidak ditentukan secara tetap. Sekretaris dapat menentukan posisi QR Code melalui **PDF Placement Editor** sebelum surat diajukan untuk approval.

---

# 2. Tujuan Produk

1. Mempercepat proses persetujuan surat oleh Gus, termasuk dari perangkat mobile.
2. Menjamin nomor surat selalu sesuai *Petunjuk Penomoran Surat Yayasan PISSYA*.
3. Menjamin setiap surat yang disetujui memiliki nomor surat yang unik dan berurutan.
4. Menyediakan QR Code unik yang tertaut dengan surat yang telah disetujui.
5. Menyediakan mekanisme verifikasi keaslian dan status surat oleh pihak eksternal melalui QR Code.
6. Memungkinkan penempatan QR Code secara fleksibel sesuai layout dokumen.
7. Membentuk arsip digital surat keluar yang terpusat dan mudah ditelusuri.
8. Membentuk audit trail untuk setiap proses pengajuan, persetujuan, penolakan, dan verifikasi.

---

# 3. Ruang Lingkup

## 3.1 Termasuk (In-Scope)

- Manajemen user & role:
  - Sekretaris
  - Approver/Gus
  - Admin
- Upload draft surat dalam format PDF.
- Input metadata surat.
- Preview PDF.
- Penentuan posisi QR Code melalui PDF Placement Editor.
- Penyimpanan konfigurasi posisi QR Code.
- Alur approval:
  - setuju
  - tolak
  - catatan penolakan
- Penomoran surat otomatis saat surat disetujui.
- Generate QR Code unik untuk setiap surat yang disetujui.
- Pembubuhan **QR Code saja** ke file PDF final.
- Halaman verifikasi publik tanpa login.
- Arsip surat keluar.
- Pencarian surat.
- Audit trail approval.
- Verifikasi status surat melalui QR Code.
- Penyimpanan hash SHA-256 PDF final untuk pemeriksaan integritas dokumen.

---

## 3.2 Tidak Termasuk (Out-of-Scope) — Fase Ini

- Penyusunan/editing isi surat di dalam sistem.
- Pembuatan atau pembubuhan gambar tanda tangan.
- Tanda tangan elektronik berbasis gambar.
- Tanda tangan elektronik tersertifikasi.
- Integrasi sertifikat elektronik resmi BSrE/BSSN.
- Integrasi PSrE.
- Multi-level approval berjenjang.
- Notifikasi WhatsApp/Telegram.
- OCR untuk mendeteksi area tanda tangan secara otomatis.
- Deteksi otomatis posisi kosong pada PDF.
- Editing isi PDF setelah surat diunggah.

Integrasi tanda tangan elektronik tersertifikasi dapat menjadi pengembangan fase berikutnya.

---

# 4. Aktor & Role

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Sekretaris** | Menyusun surat di luar sistem, mengunggah draft, menentukan posisi QR dan mengajukan approval | Create surat, upload PDF, menentukan posisi QR, lihat status surat miliknya, download surat final |
| **Approver (Gus/Ketua Yayasan)** | Meninjau dan menyetujui/menolak surat | Lihat surat masuk, preview PDF, approve/reject, melihat riwayat surat yang telah disetujui |
| **Admin** | Mengelola sistem | CRUD user, CRUD jenis surat, reset counter, monitoring seluruh surat |
| **Publik** | Pihak eksternal penerima surat | Akses halaman verifikasi melalui QR Code |

---

# 5. Entity Relationship Diagram (ERD)

```text
roles (1) ──── (N) users

users (1) ──── (N) surats
                │
                ├── created_by
                └── approved_by

users (1) ──── (N) approval_logs

surats (1) ──── (N) approval_logs

surats (N) ──── (1) jenis_surats

surats (N) ──── (1) nomor_surats
```

> **Catatan:** Tabel `signatures` tidak digunakan dalam sistem dan tidak menjadi bagian dari database maupun ERD.

---

# 5.1 `roles`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| name | string | sekretaris / approver / admin |
| description | text | Deskripsi role |

---

# 5.2 `users`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| role_id | FK → roles | |
| name | string | Nama user |
| email | string, unique | Digunakan untuk login |
| password | string | Hashed |
| phone | string, nullable | Nomor telepon |
| status | enum | aktif / nonaktif |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.3 `jenis_surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| kode | string | A.1, A.2, B.1, dst. |
| nama | string | Surat Tugas, Surat Undangan, dst. |
| kategori | enum | umum / khusus |
| pakai_bulan_romawi | boolean | Aturan bulan Romawi |
| deskripsi | text | |

---

# 5.4 `nomor_surats`

Counter tahunan per jenis surat.

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats | |
| tahun | integer | Tahun berjalan |
| last_number | integer | Nomor urut terakhir |
| updated_at | timestamp | |

Constraint:

```text
UNIQUE (jenis_surat_id, tahun)
```

---

# 5.5 `surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats | |
| nomor_surat_id | FK → nomor_surats, nullable | Diisi setelah approval |
| nomor_surat_formatted | string, nullable | Nomor surat lengkap |
| perihal | string | |
| tujuan_surat | text | |
| tanggal_surat | date | |
| file_draft | json | Path & metadata file draft |
| file_final | json, nullable | Path & metadata PDF final |
| qr_position | json, nullable | Posisi QR Code pada PDF |
| verification_token | string, unique, nullable | Token verifikasi unik |
| file_hash | string, nullable | SHA-256 PDF final |
| status | enum | draft / menunggu_persetujuan / ditolak / disetujui |
| catatan_penolakan | text, nullable | |
| created_by | FK → users | Sekretaris |
| approved_by | FK → users, nullable | Approver |
| approved_at | timestamp, nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.6 Struktur `qr_position` (TTE Badge)

Field `qr_position` menyimpan posisi area **TTE Badge** (kartu tanda tangan elektronik yang berisi QR code dan teks metadata) menggunakan koordinat relatif terhadap ukuran halaman PDF dengan titik acuan awal **kiri-atas (top-left)**.

Contoh:

```json
{
    "page": 1,
    "x": 0.72,
    "y": 0.78,
    "width": 0.26,
    "height": 0.10
}
```

Keterangan:

| Field | Keterangan |
|---|---|
| `page` | Nomor halaman PDF (1-based index) |
| `x` | Posisi horizontal relatif (0–1), dihitung dari tepi kiri halaman |
| `y` | Posisi vertikal relatif (0–1), dihitung dari tepi atas halaman |
| `width` | Lebar kartu TTE relatif terhadap lebar halaman |
| `height` | Tinggi kartu TTE relatif terhadap tinggi halaman (dikunci secara proporsional sesuai rasio aspek kartu) |

*Catatan*: Rasio aspek kartu TTE dikunci secara proporsional (misalnya 2.6:1) pada UI Editor. Pendekatan koordinat relatif dan titik awal kiri-atas dipilih untuk mempermudah integrasi editor visual berbasis web (React) dengan backend generator PDF.

---

# 5.7 `approval_logs`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats | |
| user_id | FK → users | Pelaku aksi |
| aksi | enum | diajukan / disetujui / ditolak |
| catatan | text, nullable | |
| created_at | timestamp | |

Audit log tidak boleh diedit atau dihapus oleh user biasa.

---

# 6. Functional Requirements

## 6.1 Modul Autentikasi & User Management

### FR-01

Sistem harus menyediakan login berbasis email dan password.

### FR-02

Sistem harus menerapkan role-based access control.

### FR-03

Admin dapat membuat, mengedit, menonaktifkan, dan mengaktifkan akun user.

---

# 6.2 Modul Master Data

### FR-04

Admin dapat mengelola:

- jenis surat
- kode surat
- kategori
- aturan bulan Romawi

### FR-05

Admin dapat mengelola atau mereset counter nomor surat.

---

# 6.3 Modul Pengajuan Surat

### FR-06

Sekretaris dapat mengunggah PDF draft surat.

### FR-07

Sekretaris harus memasukkan metadata:

- jenis surat
- perihal
- tujuan surat
- tanggal surat

### FR-08

Sistem menyimpan surat dengan status:

```text
menunggu_persetujuan
```

### FR-09

Sekretaris dapat melihat daftar surat miliknya beserta status.

### FR-10

Sekretaris dapat melihat preview PDF sebelum mengajukan surat.

---

# 6.4 Modul PDF Placement Editor

### FR-11

Sistem menyediakan PDF Placement Editor berbasis visual (React + React PDF) untuk menentukan posisi TTE Badge.

### FR-12

Sekretaris dapat memilih halaman PDF tempat TTE Badge akan ditempatkan.

### FR-13

Sekretaris dapat melakukan interaksi drag-and-drop dan resize pada spesimen/skeleton TTE Badge di atas kanvas PDF.

### FR-14

TTE Badge direpresentasikan sebagai kartu spesimen persegi panjang (dengan rasio aspek tetap terkunci, misalnya 2.6:1):

```text
┌─────────────────────────────────┐
│  ┌───────┐  TTE Oleh: [Nama]    │
│  │  QR   │  [Tanggal & Waktu]   │
│  │ CODE  │                      │
│  └───────┘  [URL Verifikasi]    │
└─────────────────────────────────┘
```

Tidak terdapat objek pemindaian gambar tanda tangan basah dalam editor. Yang ditempatkan adalah spesimen representasi TTE Badge kartu di atas.

### FR-15

Posisi TTE Badge dihitung dari sudut **kiri-atas (top-left)** halaman PDF dan disimpan menggunakan koordinat relatif (nilai 0–1) terhadap ukuran lebar dan tinggi halaman PDF.

### FR-15-A

Editor UI wajib melakukan *locking aspect ratio* pada elemen spesimen TTE Badge saat proses resize untuk menghindari distorsi/stretch gambar.

### FR-16

Sistem dapat menyediakan posisi default TTE Badge berdasarkan `jenis_surat`.

### FR-17

Sekretaris dapat mengubah posisi default tersebut sebelum surat diajukan.

### FR-18

Setelah surat diajukan untuk approval, konfigurasi posisi TTE Badge tidak dapat diubah tanpa membuat atau mengunggah revisi.

---

# 6.5 Modul Approval

### FR-19

Approver dapat melihat daftar surat dengan status:

```text
menunggu_persetujuan
```

### FR-20

Approver dapat membuka preview PDF sebelum memberikan keputusan.

### FR-21

Approver dapat menolak surat dengan catatan alasan.

Ketika ditolak:

```text
status = ditolak
```

Sekretaris dapat melakukan revisi dan mengunggah kembali dokumen.

### FR-22

Approver dapat menyetujui surat.

Saat approval:

1. Sistem melakukan locking counter nomor surat.
2. Sistem menghasilkan nomor surat.
3. Sistem membuat verification token unik.
4. Sistem membuat QR Code berdasarkan verification token.
5. Sistem men-generate gambar TTE Badge (PNG) secara dinamis menggunakan template SVG/HTML yang berisi QR Code dan metadata teks (Nama Approver, Tanggal & Waktu Approval, dan URL Verifikasi).
6. Sistem mengambil konfigurasi posisi dari `qr_position`.
7. Sistem mengonversi koordinat relatif top-left dari database ke koordinat absolut PDF (bottom-left) sesuai ukuran halaman PDF yang bersangkutan.
8. Sistem membubuhkan gambar TTE Badge tersebut ke dokumen PDF.
9. Sistem menghitung SHA-256 PDF final.
10. Sistem menyimpan PDF sebagai `file_final`.
11. Sistem menyimpan hash sebagai `file_hash`.
12. Sistem mengubah status menjadi `disetujui`.
13. Sistem mengisi `approved_by`.
14. Sistem mengisi `approved_at`.
15. Sistem mencatat approval ke `approval_logs`.

**Tidak ada proses pembubuhan scan tanda tangan basah atau tanda tangan elektronik berbasis sertifikat pihak ketiga ke PDF.**

---

# 6.6 Modul QR Code & Verifikasi

### FR-23

Setiap surat yang disetujui harus memiliki verification token yang unik.

### FR-24

QR Code harus mengarah ke URL verifikasi publik.

Contoh:

```text
https://esurat.pissya.or.id/verify/8f72a91c3b
```

### FR-25

QR Code dan metadata teks di dalam TTE Badge yang dibubuhkan ke PDF berfungsi sebagai identitas/tautan untuk melakukan verifikasi surat pada sistem.

### FR-26

Sistem **tidak membubuhkan scan gambar tanda tangan basah** ke PDF. Sebagai gantinya, sistem membubuhkan kartu TTE Badge dinamis.

PDF final memiliki gambar kartu TTE Badge tersemat di halaman terpilih.

### FR-27

Sistem **tidak mengklaim QR Code sebagai tanda tangan elektronik tersertifikasi**.

### FR-28

Informasi validasi dan detail dokumen ditampilkan secara terstruktur pada halaman verifikasi publik dengan layout menyerupai spesimen berikut:

```text
┌────────────────────────────────────────────────────────┐
│  [Logo Yayasan]                                        │
├────────────────────────────────────────────────────────┤
│                  VERIFIKASI DOKUMEN                    │
│                                                        │
│                         ( ✓ )                          │
│                                                        │
│  Status Dokumen     Nomor Surat         Satuan Kerja   │
│     [AKTIF]         [No. Surat]        [Nama Yayasan]  │
│                                                        │
│  Keterangan (Perihal)                                  │
│  [Perihal Surat ...]                                   │
│                                                        │
│  Penandatangan                         Waktu TTD       │
│  [Nama Pejabat/Approver]          [Tgl & Jam Approval] │
│                                                        │
│                        Dokumen                         │
│                      [ Download ]                      │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Catatan kaki TTE & Hak Cipta                           │
└────────────────────────────────────────────────────────┘
```

---

# 6.7 Modul Verifikasi Publik

### FR-29

Halaman verifikasi dapat diakses tanpa login (publik) melalui URL dari QR Code.

### FR-30

Halaman verifikasi harus memiliki elemen UI/UX berikut sesuai contoh layout referensi:

1. **Header**: Menampilkan logo Yayasan dan judul halaman "VERIFIKASI DOKUMEN".
2. **Ikon Status Utama**: Lambang centang hijau (check-mark) besar di bagian tengah untuk indikasi instan dokumen valid.
3. **Detail Grid**:
   * **Status dokumen**: Menampilkan label "AKTIF" dengan visualisasi warna hijau terang.
   * **Nomor Surat**: Nomor lengkap surat yang sah.
   * **Satuan Kerja**: Nama unit kerja atau organisasi (Yayasan/Lembaga).
   * **Keterangan**: Menampilkan perihal/tujuan surat.
   * **Penandatangan**: Nama lengkap pejabat penandatangan beserta gelar dan NIP/Identitas.
   * **Waktu Penandatangan**: Tanggal dan jam lengkap saat persetujuan dilakukan disertai ikon kalender & jam.
4. **Unduh Dokumen**: Tombol "Download" berwarna hijau untuk mengunduh berkas PDF final yang terverifikasi langsung dari storage.
5. **Catatan Kaki (Footer Note)**: Teks penjelasan penandatanganan elektronik dan hak cipta sistem di bagian bawah halaman.

### FR-31

Sistem melakukan pemeriksaan integritas PDF berdasarkan SHA-256 apabila file diperiksa oleh sistem.

### FR-32

Jika verification token tidak ditemukan atau tidak valid, sistem menampilkan halaman error terstruktur:

```text
Dokumen tidak ditemukan atau tidak valid.
```

---

# 6.8 Modul Arsip & Pencarian

### FR-34

User dapat mencari surat berdasarkan:

- nomor surat
- jenis surat
- status
- tanggal
- pembuat

### FR-35

User yang memiliki hak akses dapat mengunduh `file_final`.

### FR-36

PDF final yang telah disetujui tidak dapat diedit melalui sistem.

---

# 7. Penomoran Surat

### FR-37

Penomoran hanya terjadi ketika surat disetujui.

### FR-38

Format surat umum:

```text
[Kode].[Nomor Urut]/YA-PISSYA/[Bulan Romawi]/[Tahun]
```

Contoh:

```text
A.2-59/YA-PISSYA/VIII/2026
```

### FR-39

Surat Keputusan B.1:

```text
B.1-[Nomor Urut]/YA-PISSYA/[Tahun]
```

Contoh:

```text
B.1-12/YA-PISSYA/2026
```

### FR-40

Nomor urut di-reset setiap tahun.

### FR-41

Sistem harus menggunakan database transaction dan locking saat melakukan increment counter.

---

# 8. Alur Utama Sistem

```text
Sekretaris Login
       │
       ▼
Upload PDF Draft
       │
       ▼
Isi Metadata
       │
       ▼
PDF Placement Editor
       │
       ▼
Tentukan Posisi QR
       │
       ▼
Preview
       │
       ▼
Ajukan Approval
       │
       ▼
┌──────────────────────┐
│  Menunggu Approval   │
└──────────┬───────────┘
           │
           ▼
        Gus Login
           │
           ▼
      Preview Surat
           │
       ┌───┴───┐
       │       │
       ▼       ▼
     Tolak   Setuju
       │       │
       │       ▼
       │   Generate Nomor
       │       │
       │       ▼
       │   Generate Token
       │       │
       │       ▼
       │   Generate QR
       │       │
       │       ▼
       │   Stamp QR ke PDF
       │       │
       │       ▼
       │   Generate SHA-256
       │       │
       │       ▼
       │   Simpan PDF Final
       │       │
       │       ▼
       │    Disetujui
       │
       ▼
   Revisi Surat
```

---

# 9. Proses Generate PDF Final

Pada saat approval:

```text
                    PDF DRAFT
                       │
                       ▼
                Generate Nomor
                       │
                       ▼
             Generate Verification
                    Token
                       │
                       ▼
                  Generate QR
                       │
                       ▼
            Ambil QR Position
                       │
                       ▼
              Stamp QR ke PDF
                       │
                       ▼
               Generate SHA-256
                       │
                       ▼
                  PDF FINAL
```

Contoh hasil:

```text
┌─────────────────────────────────────┐
│                                     │
│             SURAT                   │
│                                     │
│      Isi surat dibuat manual        │
│      oleh sekretaris                │
│                                     │
│                                     │
│                      ┌───────┐      │
│                      │       │      │
│                      │  QR   │      │
│                      │       │      │
│                      └───────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Tidak ada gambar tanda tangan yang ditambahkan ke PDF.**

---

# 10. QR Code

QR Code berisi URL verifikasi, bukan seluruh informasi surat.

Contoh:

```text
https://esurat.pissya.or.id/verify/01JXYZ...
```

Sistem menggunakan token yang unik dan sulit ditebak.

Ketika QR dipindai:

```text
QR
 │
 ▼
/verify/{token}
 │
 ▼
Cari Surat
 │
 ▼
Validasi Status
 │
 ▼
Validasi Integritas
 │
 ▼
Tampilkan Informasi
```

---

# 11. Keamanan

## 11.1 Authentication

- Password di-hash.
- Session authentication.
- Role-based authorization.
- Session timeout.

## 11.2 Authorization

Hanya approver yang berwenang yang dapat melakukan approval.

```text
Sekretaris
   ❌ approve

Admin
   ❌ approve

Approver
   ✓ approve
```

## 11.3 Verification Token

Token QR:

- unik
- tidak mudah ditebak
- tidak menggunakan ID database secara langsung
- tidak dapat digunakan untuk mengubah dokumen

## 11.4 Audit Trail

Semua aksi penting dicatat:

```text
UPLOAD
SUBMIT
APPROVED
REJECTED
DOWNLOADED
VERIFIED
```

---

# 12. Integritas Dokumen

Setelah PDF final selesai dibuat, sistem menghasilkan SHA-256 hash.

```text
PDF FINAL
    │
    ▼
SHA-256
    │
    ▼
A9C4D7E8...
```

Hash disimpan pada field:

```text
surats.file_hash
```

Ketika file diperiksa:

```text
PDF
 │
 ▼
SHA-256
 │
 ▼
Bandingkan dengan file_hash
 │
 ├── Sama
 │     └── Dokumen sesuai
 │
 └── Berbeda
       └── Dokumen telah berubah
```

---

# 13. Business Rules

1. Nomor surat tidak pernah diberikan sebelum surat disetujui.
2. Satu kombinasi `jenis_surat_id + tahun` hanya memiliki satu counter.
3. Surat B.1 menggunakan counter terpisah dan tidak menggunakan bulan Romawi.
4. Setiap surat yang disetujui memiliki verification token unik.
5. Setiap surat yang disetujui memiliki QR Code unik.
6. QR Code merupakan tautan untuk melakukan verifikasi surat.
7. Sistem **tidak membubuhkan gambar tanda tangan** ke PDF.
8. Sistem **tidak menggunakan tabel `signatures`**.
9. Sistem **tidak mengklaim QR Code sebagai TTE tersertifikasi** pada fase ini.
10. Posisi QR Code ditentukan sebelum approval.
11. Posisi QR Code disimpan berdasarkan halaman dan koordinat relatif.
12. Posisi QR Code dapat menggunakan default berdasarkan jenis surat.
13. Setelah surat disetujui, `file_final` tidak dapat diubah.
14. Jika surat perlu direvisi setelah disetujui, harus melalui proses surat baru/revisi sesuai workflow.
15. Setiap perubahan status surat wajib dicatat pada `approval_logs`.
16. Verification token tidak boleh digunakan untuk memodifikasi surat.
17. `file_hash` merepresentasikan hash PDF final yang telah disimpan.

---

# 14. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | Password di-hash, RBAC, validasi upload PDF |
| **Audit** | Semua aksi approval tercatat dengan timestamp dan user_id |
| **Ketersediaan** | Sistem responsive dan dapat digunakan melalui mobile browser |
| **Performa** | Generate QR dan stamping PDF selesai dalam hitungan detik |
| **Kompatibilitas** | PDF final dapat dibuka pada PDF viewer standar |
| **Scalability** | Counter nomor berdasarkan tahun dan jenis surat |
| **Usability** | PDF Placement Editor mudah digunakan oleh sekretaris |
| **Integrity** | PDF final memiliki SHA-256 hash untuk pemeriksaan integritas dokumen |

---

# 15. User Experience — PDF Placement Editor

Ketika sekretaris mengunggah surat:

```text
┌──────────────────────────────────────────────────────┐
│                PDF PLACEMENT EDITOR                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│              ┌─────────────────────┐                 │
│              │                     │                 │
│              │      ISI SURAT      │                 │
│              │                     │                 │
│              │                     │                 │
│              │              ┌────┐ │                 │
│              │              │ QR │ │                 │
│              │              └────┘ │                 │
│              │                     │                 │
│              └─────────────────────┘                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Halaman: 1 / 2                                      │
│                                                      │
│ [Reset Posisi]                    [Simpan Posisi]    │
└──────────────────────────────────────────────────────┘
```

QR dapat:

- dipindahkan dengan drag & drop
- diperbesar
- diperkecil
- dipindahkan ke halaman lain

---

# 16. Template Posisi QR

Untuk mempercepat proses, Admin dapat menyediakan posisi default berdasarkan jenis surat.

Contoh:

```text
Surat A.1
→ Page 1
→ kanan bawah

Surat A.2
→ Page 1
→ kanan bawah

Surat B.1
→ Page 2
→ kiri bawah
```

Default tidak bersifat wajib.

Sekretaris tetap dapat menyesuaikannya pada PDF Placement Editor.

---

# 17. Status Surat

```text
DRAFT
   │
   ▼
MENUNGGU_PERSETUJUAN
   │
   ├─────────────┐
   ▼             ▼
DITOLAK       DISETUJUI
                  │
                  ▼
             PDF FINAL
                  │
                  ▼
                ARSIP
```

---

# 18. Halaman Verifikasi Publik

Contoh:

```text
╔══════════════════════════════════════╗
║                                      ║
║       ✓ DOKUMEN TERVERIFIKASI        ║
║                                      ║
║       Yayasan PISSYA                 ║
║                                      ║
║ Nomor Surat                          ║
║ A.2-59/YA-PISSYA/VIII/2026           ║
║                                      ║
║ Jenis Surat                          ║
║ Surat Undangan                       ║
║                                      ║
║ Perihal                              ║
║ Undangan Kegiatan                    ║
║                                      ║
║ Disetujui Oleh                       ║
║ Gus / Ketua Yayasan                  ║
║                                      ║
║ Tanggal Approval                     ║
║ 09 Agustus 2026                      ║
║                                      ║
║ Status                               ║
║ ✓ AKTIF                              ║
║                                      ║
║ Integritas Dokumen                   ║
║ ✓ SESUAI                             ║
║                                      ║
║ [ DOWNLOAD DOKUMEN ]                 ║
║                                      ║
╚══════════════════════════════════════╝
```

---

# 19. Kriteria Penerimaan

- [ ] Sekretaris dapat login.
- [ ] Sekretaris dapat mengunggah PDF.
- [ ] Sekretaris dapat mengisi metadata surat.
- [ ] Sekretaris dapat melihat preview PDF.
- [ ] Sekretaris dapat membuka PDF Placement Editor.
- [ ] Sekretaris dapat menentukan halaman QR.
- [ ] Sekretaris dapat drag & drop QR.
- [ ] Sekretaris dapat mengubah ukuran QR.
- [ ] Posisi QR tersimpan dengan benar.
- [ ] Posisi QR tetap benar meskipun ukuran viewport berubah.
- [ ] Gus dapat melihat surat dari perangkat mobile.
- [ ] Gus dapat menyetujui surat dari mobile.
- [ ] Gus dapat menolak surat dengan catatan.
- [ ] Nomor surat hanya dibuat setelah approval.
- [ ] Nomor surat tidak mengalami duplikasi.
- [ ] Sistem menghasilkan verification token unik.
- [ ] Sistem menghasilkan QR Code.
- [ ] **PDF final hanya memiliki QR Code sebagai elemen verifikasi dan tidak memiliki gambar tanda tangan.**
- [ ] **Tidak terdapat tabel/model `signatures` pada database.**
- [ ] QR Code dapat dipindai menggunakan kamera smartphone.
- [ ] QR Code mengarah ke halaman verifikasi yang benar.
- [ ] Halaman verifikasi dapat diakses tanpa login.
- [ ] Halaman verifikasi menampilkan informasi surat dan approver.
- [ ] Halaman verifikasi dapat memeriksa integritas PDF berdasarkan SHA-256.
- [ ] PDF final dapat di-download.
- [ ] PDF final tidak dapat diubah melalui sistem.
- [ ] Semua approval tercatat di `approval_logs`.
- [ ] Hash PDF final tersimpan pada `surats.file_hash`.

---

# 20. Pengembangan Masa Depan

Fase berikutnya dapat menambahkan:

### TTE Tersertifikasi

```text
Sistem E-Surat
      │
      ▼
PSrE
      │
      ▼
Sertifikat Elektronik
      │
      ▼
PDF Digital Signed
```

Pengembangan lain:

- Notifikasi WhatsApp
- Notifikasi Telegram
- Email notification
- Multi-level approval
- Template surat
- OCR
- Digital certificate
- PAdES
- Timestamp server
- Revocation
- Dashboard statistik
- Mobile application

Integrasi tersebut tidak termasuk dalam versi 1.1.
