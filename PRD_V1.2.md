# Product Requirements Document (PRD)
# Sistem E-Surat Yayasan PISSYA

| | |
|---|---|
| **Nama Produk** | Sistem E-Surat Yayasan PISSYA |
| **Versi Dokumen** | 1.2 |
| **Konteks** | Program Kerja KKN — Pondok Pesantren Islamiyah Syafi'iyah, Paiton, Probolinggo |
| **Disusun oleh** | Tim KKN |
| **Status** | Draft untuk review |
| **Perubahan dari v1.1** | (1) Menambahkan alur approval berjenjang untuk surat dari Lembaga (Sekretaris Lembaga → Kepala Lembaga → Gus). (2) Menambahkan fitur **Disposisi** — Gus dapat mengirim instruksi/arahan ke satu atau beberapa Lembaga. |

---

# 1. Latar Belakang

Yayasan PISSYA saat ini menerbitkan surat resmi secara manual, mulai dari penyusunan, penomoran, hingga proses persetujuan oleh Ketua Yayasan (Gus). Proses ini rawan terhadap keterlambatan approval karena Gus tidak selalu berada di tempat, nomor surat ganda atau salah urut, serta sulitnya verifikasi keaslian surat oleh pihak eksternal.

Selain surat yang berasal dari internal Yayasan, terdapat juga surat yang berasal dari **Lembaga-lembaga** di bawah naungan Yayasan (mis. unit pendidikan, unit usaha, dsb.). Surat dari Lembaga tersebut perlu melalui persetujuan **Kepala Lembaga** yang bersangkutan terlebih dahulu, sebelum diteruskan ke Gus untuk persetujuan akhir.

Di sisi lain, Gus juga memerlukan sarana untuk mengirimkan **arahan/instruksi (disposisi)** kepada satu atau beberapa Lembaga terkait suatu surat atau hal tertentu, dan memantau tindak lanjutnya.

Sistem E-Surat dikembangkan untuk mendigitalisasi **alur pengajuan, persetujuan berjenjang, penomoran, disposisi, dan verifikasi surat**, tanpa mengubah cara surat itu sendiri disusun. Surat tetap dibuat secara manual oleh sekretaris menggunakan Microsoft Word kemudian dikonversi menjadi PDF.

Sistem tidak membubuhkan gambar tanda tangan atau tanda tangan elektronik berbasis sertifikat pada PDF pada fase ini. Sebagai gantinya, setelah surat disetujui oleh approver akhir (Gus), sistem membubuhkan **QR Code unik** ke dalam PDF yang mengarah ke halaman verifikasi publik.

Untuk mengakomodasi perbedaan layout setiap surat, posisi QR Code tidak ditentukan secara tetap. Sekretaris dapat menentukan posisi QR Code melalui **PDF Placement Editor** sebelum surat diajukan untuk approval.

---

# 2. Tujuan Produk

1. Mempercepat proses persetujuan surat oleh Kepala Lembaga dan Gus, termasuk dari perangkat mobile.
2. Menjamin nomor surat selalu sesuai *Petunjuk Penomoran Surat Yayasan PISSYA*.
3. Menjamin setiap surat yang disetujui memiliki nomor surat yang unik dan berurutan.
4. Menyediakan QR Code unik yang tertaut dengan surat yang telah disetujui.
5. Menyediakan mekanisme verifikasi keaslian dan status surat oleh pihak eksternal melalui QR Code.
6. Memungkinkan penempatan QR Code secara fleksibel sesuai layout dokumen.
7. Membentuk arsip digital surat keluar yang terpusat dan mudah ditelusuri.
8. Membentuk audit trail untuk setiap proses pengajuan, persetujuan, penolakan, dan verifikasi.
9. **Mendukung alur persetujuan berjenjang untuk surat yang berasal dari Lembaga (Sekretaris Lembaga → Kepala Lembaga → Gus).**
10. **Menyediakan sarana bagi Gus untuk mengirim disposisi/arahan ke satu atau beberapa Lembaga, serta memantau status tindak lanjutnya.**

---

# 3. Ruang Lingkup

## 3.1 Termasuk (In-Scope)

- Manajemen user & role:
  - Sekretaris Yayasan
  - **Sekretaris Lembaga**
  - **Kepala Lembaga**
  - Approver/Gus
  - Admin
- Manajemen data **Lembaga**.
- Upload draft surat dalam format PDF.
- Input metadata surat.
- Preview PDF.
- Penentuan posisi QR Code melalui PDF Placement Editor.
- Penyimpanan konfigurasi posisi QR Code.
- **Alur approval berjenjang (multi-level):**
  - Surat dari Sekretaris Yayasan → langsung ke Gus (1 level).
  - Surat dari Sekretaris Lembaga → Kepala Lembaga → Gus (2 level).
- Alur approval per level:
  - setuju
  - tolak
  - catatan penolakan
- Penomoran surat otomatis saat surat disetujui pada level final (Gus).
- Generate QR Code unik untuk setiap surat yang disetujui.
- Pembubuhan **QR Code saja** ke file PDF final.
- Halaman verifikasi publik tanpa login.
- Arsip surat keluar.
- Pencarian surat.
- Audit trail approval (termasuk per level).
- Verifikasi status surat melalui QR Code.
- Penyimpanan hash SHA-256 PDF final untuk pemeriksaan integritas dokumen.
- **Fitur Disposisi:**
  - Gus dapat membuat disposisi (instruksi/arahan) yang ditujukan ke satu atau beberapa Lembaga sekaligus.
  - Disposisi dapat merujuk ke surat yang sudah ada di sistem (opsional) atau berdiri sendiri (standalone).
  - Setiap Lembaga tujuan dapat menandai status tindak lanjut disposisi miliknya secara independen.
  - Gus dapat memantau status tindak lanjut disposisi per Lembaga.

## 3.2 Tidak Termasuk (Out-of-Scope) — Fase Ini

- Penyusunan/editing isi surat di dalam sistem.
- Pembuatan atau pembubuhan gambar tanda tangan.
- Tanda tangan elektronik berbasis gambar.
- Tanda tangan elektronik tersertifikasi.
- Integrasi sertifikat elektronik resmi BSrE/BSSN.
- Integrasi PSrE.
- Notifikasi WhatsApp/Telegram.
- OCR untuk mendeteksi area tanda tangan secara otomatis.
- Deteksi otomatis posisi kosong pada PDF.
- Editing isi PDF setelah surat diunggah.
- Approval berjenjang lebih dari 2 level (mis. Sekretaris Lembaga → Kepala Lembaga → Kepala Bidang → Gus) — struktur saat ini dirancang maksimal 2 level (Kepala Lembaga, lalu Gus).
- Disposisi berjenjang/lanjutan (mis. Lembaga meneruskan disposisi ke sub-unit di bawahnya) — disposisi pada fase ini hanya satu arah dari Gus ke Lembaga.

> **Catatan:** "Multi-level approval berjenjang" yang sebelumnya berstatus *out-of-scope* pada PRD v1.1 kini masuk ke **in-scope** pada v1.2, dengan batasan maksimal 2 level sebagaimana disebutkan di atas.

Integrasi tanda tangan elektronik tersertifikasi dapat menjadi pengembangan fase berikutnya.

---

# 4. Aktor & Role

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Sekretaris Yayasan** | Menyusun surat internal Yayasan, mengunggah draft, menentukan posisi QR dan mengajukan approval langsung ke Gus | Create surat, upload PDF, menentukan posisi QR, lihat status surat miliknya, download surat final |
| **Sekretaris Lembaga** | Menyusun surat atas nama Lembaga tempatnya bertugas, mengunggah draft, menentukan posisi QR dan mengajukan approval ke Kepala Lembaga | Create surat (terikat ke satu Lembaga), upload PDF, menentukan posisi QR, lihat status surat miliknya, download surat final |
| **Kepala Lembaga** | Meninjau dan menyetujui/menolak surat yang diajukan Sekretaris Lembaga di lembaganya, sebelum diteruskan ke Gus | Lihat surat masuk dari lembaganya, preview PDF, approve/reject (level 1), melihat riwayat surat lembaganya, **menerima & menindaklanjuti disposisi dari Gus** |
| **Approver (Gus/Ketua Yayasan)** | Meninjau dan menyetujui/menolak surat pada level final; mengirim disposisi ke Lembaga | Lihat semua surat yang masuk ke levelnya, preview PDF, approve/reject (level final), melihat riwayat surat, **membuat & memantau disposisi ke Lembaga** |
| **Admin** | Mengelola sistem | CRUD user, CRUD jenis surat, CRUD Lembaga, reset counter, monitoring seluruh surat & disposisi |
| **Publik** | Pihak eksternal penerima surat | Akses halaman verifikasi melalui QR Code |

---

# 5. Entity Relationship Diagram (ERD)

```text
roles (1) ──── (N) users

lembagas (1) ──── (N) users
                        (Sekretaris Lembaga & Kepala Lembaga terikat ke satu lembaga)

lembagas (1) ──── (N) surats
                        (surat dari Sekretaris Lembaga terikat ke satu lembaga)

users (1) ──── (N) surats
                │
                ├── created_by
                └── approved_by  (approver level final / Gus)

surats (1) ──── (N) approval_steps

surats (1) ──── (N) approval_logs

surats (N) ──── (1) jenis_surats

surats (N) ──── (1) nomor_surats

users (1) ──── (N) disposisis          (created_by = Gus)

disposisis (1) ──── (N) disposisi_targets

lembagas (1) ──── (N) disposisi_targets

surats (1) ──── (N) disposisis          (opsional, disposisi bisa merujuk surat)
```

> **Catatan:** Tabel `signatures` tidak digunakan dalam sistem dan tidak menjadi bagian dari database maupun ERD (tidak berubah dari v1.1).

---

# 5.1 `roles`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| name | string | sekretaris_yayasan / sekretaris_lembaga / kepala_lembaga / approver / admin |
| description | text | Deskripsi role |

---

# 5.2 `lembagas` *(baru di v1.2)*

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| nama | string | Nama Lembaga (mis. "MA PISSYA", "Koperasi Pesantren") |
| kode | string, nullable | Kode internal Lembaga (opsional) |
| status | enum | aktif / nonaktif |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.3 `users`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| role_id | FK → roles | |
| lembaga_id | FK → lembagas, **nullable** | **Baru di v1.2.** `null` untuk user level Yayasan (Sekretaris Yayasan, Gus, Admin); terisi untuk Sekretaris Lembaga & Kepala Lembaga |
| name | string | Nama user |
| email | string, unique | Digunakan untuk login |
| password | string | Hashed |
| phone | string, nullable | Nomor telepon |
| status | enum | aktif / nonaktif |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.4 `jenis_surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| kode | string | A.1, A.2, B.1, dst. |
| nama | string | Surat Tugas, Surat Undangan, dst. |
| kategori | enum | umum / khusus |
| pakai_bulan_romawi | boolean | Aturan bulan Romawi |
| deskripsi | text | |

---

# 5.5 `nomor_surats`

Counter tahunan per jenis surat. Tidak berubah dari v1.1 — counter tetap berlaku secara Yayasan-wide (tidak dipecah per Lembaga), karena aturan penomoran resmi PISSYA berlaku terpusat.

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

# 5.6 `surats`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| jenis_surat_id | FK → jenis_surats | |
| lembaga_id | FK → lembagas, **nullable** | **Baru di v1.2.** `null` jika surat berasal dari Sekretaris Yayasan; terisi jika berasal dari Sekretaris Lembaga |
| nomor_surat_id | FK → nomor_surats, nullable | Diisi setelah approval final |
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
| **current_level** | integer | **Baru di v1.2.** Menunjukkan step approval yang sedang aktif (1 = Kepala Lembaga, 2 = Gus; atau langsung 1 = Gus jika `lembaga_id` null) |
| catatan_penolakan | text, nullable | |
| created_by | FK → users | Sekretaris (Yayasan/Lembaga) yang mengunggah |
| approved_by | FK → users, nullable | Approver **final** (Gus) yang menyetujui |
| approved_at | timestamp, nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.7 `approval_steps` *(baru di v1.2)*

Merepresentasikan rantai persetujuan berjenjang untuk sebuah surat. Jumlah baris per surat = jumlah level yang dibutuhkan (1 untuk surat Yayasan, 2 untuk surat Lembaga).

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats | |
| level | integer | Urutan step (1, 2, dst.) |
| role_required | enum | kepala_lembaga / approver |
| lembaga_id | FK → lembagas, nullable | Menentukan Kepala Lembaga mana yang berwenang pada step ini (null untuk step approver/Gus) |
| status | enum | menunggu / disetujui / ditolak / dilewati |
| acted_by | FK → users, nullable | User yang bertindak pada step ini |
| catatan | text, nullable | |
| acted_at | timestamp, nullable | |
| created_at | timestamp | |

**Logika pembuatan rantai saat surat diajukan (submit):**

- Surat dari **Sekretaris Lembaga** (`surats.lembaga_id` terisi):
  ```text
  step 1 → role_required: kepala_lembaga, lembaga_id: <lembaga asal surat>
  step 2 → role_required: approver, lembaga_id: null
  ```
- Surat dari **Sekretaris Yayasan** (`surats.lembaga_id` = null):
  ```text
  step 1 → role_required: approver, lembaga_id: null
  ```

Status `dilewati` disediakan untuk kebutuhan khusus di masa depan (mis. jika suatu saat sebuah Lembaga tidak memiliki Kepala Lembaga aktif dan Admin perlu melewati step tersebut secara manual); pada fase ini nilai tersebut tidak digunakan secara default.

---

# 5.8 Struktur `qr_position` (TTE Badge)

*(Tidak berubah dari v1.1)*

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

| Field | Keterangan |
|---|---|
| `page` | Nomor halaman PDF (1-based index) |
| `x` | Posisi horizontal relatif (0–1), dihitung dari tepi kiri halaman |
| `y` | Posisi vertikal relatif (0–1), dihitung dari tepi atas halaman |
| `width` | Lebar kartu TTE relatif terhadap lebar halaman |
| `height` | Tinggi kartu TTE relatif terhadap tinggi halaman (dikunci secara proporsional sesuai rasio aspek kartu) |

---

# 5.9 `approval_logs`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats | |
| user_id | FK → users | Pelaku aksi |
| **level** | integer, nullable | **Baru di v1.2.** Menunjukkan step approval terkait aksi ini |
| aksi | enum | diajukan / disetujui / ditolak |
| catatan | text, nullable | |
| created_at | timestamp | |

Audit log tidak boleh diedit atau dihapus oleh user biasa.

---

# 5.10 `disposisis` *(baru di v1.2)*

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| surat_id | FK → surats, **nullable** | Referensi surat terkait (opsional; disposisi dapat berdiri sendiri tanpa merujuk surat) |
| created_by | FK → users | Gus (pembuat disposisi) |
| perihal | string | Judul singkat disposisi |
| isi_disposisi | text | Isi arahan/instruksi |
| file_lampiran | json, nullable | Path & metadata file lampiran opsional (mis. PDF pendukung) |
| status | enum | terkirim / selesai_sebagian / selesai | Status agregat (lihat Bab 6.6) |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# 5.11 `disposisi_targets` *(baru di v1.2)*

Tabel penghubung many-to-many antara `disposisis` dan `lembagas`, sekaligus menyimpan status tindak lanjut **per Lembaga** secara independen.

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| disposisi_id | FK → disposisis | |
| lembaga_id | FK → lembagas | |
| status | enum | belum_dibaca / dibaca / diproses / selesai |
| catatan_tindak_lanjut | text, nullable | Diisi oleh Kepala Lembaga saat menindaklanjuti |
| read_at | timestamp, nullable | Waktu pertama kali dibaca oleh Lembaga terkait |
| completed_at | timestamp, nullable | Waktu ditandai selesai |
| created_at | timestamp | |
| updated_at | timestamp | |

Constraint:

```text
UNIQUE (disposisi_id, lembaga_id)
```

---

# 6. Functional Requirements

## 6.1 Modul Autentikasi & User Management

### FR-01
Sistem harus menyediakan login berbasis email dan password.

### FR-02
Sistem harus menerapkan role-based access control, termasuk role `sekretaris_lembaga` dan `kepala_lembaga`.

### FR-03
Admin dapat membuat, mengedit, menonaktifkan, dan mengaktifkan akun user.

### FR-03-A *(baru)*
Saat membuat/mengedit user dengan role `sekretaris_lembaga` atau `kepala_lembaga`, Admin **wajib** memilih satu `lembaga_id` yang mengikat user tersebut.

### FR-03-B *(baru)*
Sistem harus mencegah satu user memiliki lebih dari satu role sekaligus pada fase ini (satu user = satu role = maksimal satu Lembaga terkait).

---

## 6.2 Modul Master Data

### FR-04
Admin dapat mengelola:
- jenis surat
- kode surat
- kategori
- aturan bulan Romawi

### FR-05
Admin dapat mengelola atau mereset counter nomor surat.

### FR-05-A *(baru)*
Admin dapat mengelola data **Lembaga** (tambah, edit, nonaktifkan).

---

## 6.3 Modul Pengajuan Surat

### FR-06
Sekretaris (Yayasan atau Lembaga) dapat mengunggah PDF draft surat.

### FR-07
Sekretaris harus memasukkan metadata:
- jenis surat
- perihal
- tujuan surat
- tanggal surat

### FR-07-A *(baru)*
Jika pengunggah surat memiliki role `sekretaris_lembaga`, sistem otomatis mengisi `surats.lembaga_id` sesuai `lembaga_id` milik user tersebut (tidak dapat diubah/dipilih manual).

### FR-08
Sistem menyimpan surat dengan status:
```text
menunggu_persetujuan
```

### FR-08-A *(baru)*
Saat surat diajukan (submit), sistem membuat rantai `approval_steps` sesuai asal surat:
- Dari Sekretaris Lembaga → 2 step (Kepala Lembaga, lalu Gus).
- Dari Sekretaris Yayasan → 1 step (Gus).

`surats.current_level` diset ke `1`.

### FR-09
Sekretaris dapat melihat daftar surat miliknya beserta status **dan posisi step approval saat ini** (mis. "Menunggu Kepala Lembaga" / "Menunggu Gus").

### FR-10
Sekretaris dapat melihat preview PDF sebelum mengajukan surat.

---

## 6.4 Modul PDF Placement Editor

*(Tidak berubah dari v1.1 — berlaku sama untuk Sekretaris Yayasan maupun Sekretaris Lembaga)*

### FR-11
Sistem menyediakan PDF Placement Editor berbasis visual (React + React PDF) untuk menentukan posisi TTE Badge.

### FR-12
Sekretaris dapat memilih halaman PDF tempat TTE Badge akan ditempatkan.

### FR-13
Sekretaris dapat melakukan interaksi drag-and-drop dan resize pada spesimen/skeleton TTE Badge di atas kanvas PDF.

### FR-14
TTE Badge direpresentasikan sebagai kartu spesimen persegi panjang (rasio aspek tetap terkunci, misalnya 2.6:1):
```text
┌─────────────────────────────────┐
│  ┌───────┐  TTE Oleh: [Nama]    │
│  │  QR   │  [Tanggal & Waktu]   │
│  │ CODE  │                      │
│  └───────┘  [URL Verifikasi]    │
└─────────────────────────────────┘
```
Tidak terdapat objek pemindaian gambar tanda tangan basah dalam editor.

### FR-15
Posisi TTE Badge dihitung dari sudut **kiri-atas (top-left)** halaman PDF dan disimpan menggunakan koordinat relatif (0–1).

### FR-15-A
Editor UI wajib melakukan *locking aspect ratio* pada elemen spesimen TTE Badge saat resize.

### FR-16
Sistem dapat menyediakan posisi default TTE Badge berdasarkan `jenis_surat`.

### FR-17
Sekretaris dapat mengubah posisi default tersebut sebelum surat diajukan.

### FR-18
Setelah surat diajukan untuk approval, konfigurasi posisi TTE Badge tidak dapat diubah tanpa membuat/mengunggah revisi.

---

## 6.5 Modul Approval Berjenjang *(diperbarui signifikan di v1.2)*

### FR-19
Kepala Lembaga dapat melihat daftar surat dengan status `menunggu_persetujuan` **yang `approval_steps`-nya berada pada level dengan `lembaga_id` sama dengan lembaganya**, dan `status` step tersebut = `menunggu`.

### FR-19-A *(baru)*
Approver (Gus) dapat melihat daftar surat dengan status `menunggu_persetujuan` **yang sedang berada pada step dengan `role_required = approver`**, yaitu:
- Surat dari Sekretaris Yayasan yang baru diajukan (langsung step 1), atau
- Surat dari Sekretaris Lembaga yang step Kepala Lembaga-nya sudah `disetujui` (step 2).

Surat Lembaga yang masih menunggu Kepala Lembaga **tidak** muncul di daftar Gus.

### FR-20
Approver level manapun (Kepala Lembaga/Gus) dapat membuka preview PDF sebelum memberikan keputusan.

### FR-21
Approver pada level manapun dapat menolak surat dengan catatan alasan. Ketika ditolak:
```text
approval_steps.status (step aktif) = ditolak
surats.status = ditolak
```
Seluruh proses berhenti pada level tersebut — **tidak diteruskan ke level berikutnya**. Sekretaris dapat melakukan revisi dan mengunggah kembali dokumen (memulai rantai approval baru dari awal).

### FR-22 *(diperbarui)*
Approver pada level **bukan final** (Kepala Lembaga) dapat menyetujui surat pada levelnya:
1. `approval_steps.status` (step Kepala Lembaga) = `disetujui`, isi `acted_by` & `acted_at`.
2. `surats.current_level` bertambah ke level berikutnya (2 = Gus).
3. Surat otomatis muncul di daftar Gus (lihat FR-19-A).
4. Sistem mencatat aksi ke `approval_logs` dengan `level = 1`.
5. **Tidak** ada penomoran, QR Code, atau stamping PDF yang terjadi pada tahap ini.

### FR-22-A *(diperbarui dari FR-22 lama)*
Approver pada level **final** (Gus) dapat menyetujui surat. Saat approval final:
1. `approval_steps.status` (step Gus) = `disetujui`, isi `acted_by` & `acted_at`.
2. Sistem melakukan locking counter nomor surat.
3. Sistem menghasilkan nomor surat.
4. Sistem membuat verification token unik.
5. Sistem membuat QR Code berdasarkan verification token.
6. Sistem men-generate gambar TTE Badge (PNG) secara dinamis menggunakan template SVG/HTML yang berisi QR Code dan metadata teks (Nama Approver, Tanggal & Waktu Approval, dan URL Verifikasi).
7. Sistem mengambil konfigurasi posisi dari `qr_position`.
8. Sistem mengonversi koordinat relatif top-left dari database ke koordinat absolut PDF (bottom-left) sesuai ukuran halaman PDF yang bersangkutan.
9. Sistem membubuhkan gambar TTE Badge tersebut ke dokumen PDF.
10. Sistem menghitung SHA-256 PDF final.
11. Sistem menyimpan PDF sebagai `file_final`.
12. Sistem menyimpan hash sebagai `file_hash`.
13. Sistem mengubah `surats.status` menjadi `disetujui`.
14. Sistem mengisi `surats.approved_by` & `surats.approved_at`.
15. Sistem mencatat approval ke `approval_logs` dengan `level = 2` (atau `level = 1` jika surat Yayasan tanpa Kepala Lembaga).

**Tidak ada proses pembubuhan scan tanda tangan basah atau tanda tangan elektronik berbasis sertifikat pihak ketiga ke PDF.**

### FR-22-B *(baru)*
Penomoran, QR Code, dan stamping PDF **hanya** terjadi satu kali, yaitu pada step approval **terakhir** dalam rantai (bukan pada setiap level).

---

## 6.6 Modul Disposisi *(baru di v1.2)*

### FR-D1
Gus dapat membuat disposisi baru berisi: perihal, isi arahan/instruksi, lampiran opsional (PDF), dan referensi ke surat tertentu (opsional).

### FR-D2
Gus dapat memilih **satu atau beberapa Lembaga** sebagai target/tujuan disposisi dalam satu kali pembuatan (multi-select).

### FR-D3
Saat disposisi dibuat, sistem membuat satu baris `disposisi_targets` untuk setiap Lembaga yang dipilih, masing-masing berstatus awal `belum_dibaca`.

### FR-D4
Kepala Lembaga hanya dapat melihat disposisi yang `lembaga_id`-nya sesuai dengan lembaganya sendiri (melalui `disposisi_targets`).

### FR-D5
Status `disposisi_targets` berubah menjadi `dibaca` (dan `read_at` terisi) secara otomatis saat Kepala Lembaga membuka detail disposisi tersebut untuk pertama kali.

### FR-D6
Kepala Lembaga dapat mengubah status tindak lanjut disposisi miliknya menjadi `diproses` atau `selesai`, disertai `catatan_tindak_lanjut` (opsional untuk `diproses`, disarankan wajib untuk `selesai`).

### FR-D7
Gus dapat melihat daftar seluruh disposisi yang pernah dibuat beserta **rincian status per Lembaga tujuan** (mis. tabel: Lembaga A – selesai, Lembaga B – dibaca, Lembaga C – belum dibaca).

### FR-D8
Status agregat `disposisis.status` dihitung otomatis oleh sistem berdasarkan status seluruh `disposisi_targets` terkait:
```text
Jika seluruh target berstatus "selesai"      → disposisis.status = selesai
Jika sebagian target berstatus "selesai"     → disposisis.status = selesai_sebagian
Selain itu                                   → disposisis.status = terkirim
```

### FR-D9
Disposisi bersifat **satu arah** dari Gus ke Lembaga pada fase ini — Kepala Lembaga tidak dapat meneruskan/mendisposisikan ulang ke pihak lain melalui sistem.

### FR-D10
Disposisi tidak memengaruhi alur approval surat (`approval_steps`) — keduanya adalah modul yang independen, meskipun sebuah disposisi dapat merujuk (`surat_id`) ke surat yang sama.

---

## 6.7 Modul QR Code & Verifikasi

*(Tidak berubah dari v1.1, kecuali penegasan bahwa proses ini hanya terjadi pada approval final)*

### FR-23
Setiap surat yang disetujui **pada level final** harus memiliki verification token yang unik.

### FR-24
QR Code harus mengarah ke URL verifikasi publik.
```text
https://esurat.pissya.or.id/verify/8f72a91c3b
```

### FR-25
QR Code dan metadata teks di dalam TTE Badge yang dibubuhkan ke PDF berfungsi sebagai identitas/tautan untuk melakukan verifikasi surat pada sistem.

### FR-26
Sistem **tidak membubuhkan scan gambar tanda tangan basah** ke PDF. Sebagai gantinya, sistem membubuhkan kartu TTE Badge dinamis.

### FR-27
Sistem **tidak mengklaim QR Code sebagai tanda tangan elektronik tersertifikasi**.

### FR-28
Informasi validasi dan detail dokumen ditampilkan secara terstruktur pada halaman verifikasi publik (lihat Bab 18, tidak berubah dari v1.1).

---

## 6.8 Modul Verifikasi Publik

*(Tidak berubah dari v1.1)*

### FR-29
Halaman verifikasi dapat diakses tanpa login melalui URL dari QR Code.

### FR-30
Halaman verifikasi menampilkan header logo, ikon status, detail grid (status, nomor surat, satuan kerja, keterangan, penandatangan, waktu), tombol download, dan catatan kaki.

### FR-31
Sistem melakukan pemeriksaan integritas PDF berdasarkan SHA-256.

### FR-32
Jika verification token tidak ditemukan/tidak valid, sistem menampilkan halaman error terstruktur.

---

## 6.9 Modul Arsip & Pencarian

### FR-34 *(diperbarui)*
User dapat mencari surat berdasarkan:
- nomor surat
- jenis surat
- status
- tanggal
- pembuat
- **Lembaga asal (khusus Admin & Gus)**

### FR-34-A *(baru)*
User dapat mencari/memfilter disposisi berdasarkan Lembaga tujuan, status, dan tanggal.

### FR-35
User yang memiliki hak akses dapat mengunduh `file_final`.

### FR-36
PDF final yang telah disetujui tidak dapat diedit melalui sistem.

---

# 7. Penomoran Surat

*(Tidak berubah dari v1.1 — penomoran tetap terpusat di tingkat Yayasan, tidak dipengaruhi oleh asal Lembaga)*

### FR-37
Penomoran hanya terjadi ketika surat disetujui **pada step final (approver/Gus)**.

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

### FR-40
Nomor urut di-reset setiap tahun.

### FR-41
Sistem harus menggunakan database transaction dan locking saat melakukan increment counter.

---

# 8. Alur Utama Sistem

## 8.1 Alur Surat — Sekretaris Yayasan (1 level, tidak berubah dari v1.1)

```text
Sekretaris Yayasan Login
       │
       ▼
Upload PDF Draft → Isi Metadata → Placement Editor → Preview
       │
       ▼
Ajukan Approval  →  approval_steps: [1: approver]
       │
       ▼
   Gus Login
       │
   Preview Surat
       │
   ┌───┴───┐
 Tolak   Setuju
   │        │
   ▼        ▼
Revisi   Generate Nomor + Token + QR + Hash → PDF Final → Disetujui
```

## 8.2 Alur Surat — Sekretaris Lembaga (2 level, baru di v1.2)

```text
Sekretaris Lembaga Login
       │
       ▼
Upload PDF Draft → Isi Metadata → Placement Editor → Preview
       │
       ▼
Ajukan Approval → approval_steps: [1: kepala_lembaga (lembaga X), 2: approver]
       │
       ▼
Kepala Lembaga (lembaga X) Login
       │
   Preview Surat
       │
   ┌───┴───┐
 Tolak   Setuju
   │        │
   ▼        ▼
Revisi   current_level → 2, muncul di daftar Gus
                              │
                              ▼
                          Gus Login
                              │
                        Preview Surat
                              │
                          ┌───┴───┐
                        Tolak   Setuju
                          │        │
                          ▼        ▼
                       Revisi   Generate Nomor + Token + QR + Hash → PDF Final → Disetujui
```

## 8.3 Alur Disposisi *(baru di v1.2)*

```text
Gus Login
    │
    ▼
Buat Disposisi
(perihal, isi arahan, lampiran opsional, referensi surat opsional)
    │
    ▼
Pilih satu/beberapa Lembaga tujuan
    │
    ▼
Kirim  →  disposisi_targets dibuat per Lembaga (status: belum_dibaca)
    │
    ▼
Kepala Lembaga (masing-masing) Login
    │
    ▼
Buka Disposisi  →  status: dibaca (read_at terisi)
    │
    ▼
Tindak Lanjuti  →  status: diproses  →  status: selesai (+ catatan_tindak_lanjut)
    │
    ▼
Gus memantau status per Lembaga di dashboard disposisi
```

---

# 9. Proses Generate PDF Final

*(Tidak berubah dari v1.1, hanya ditegaskan bahwa proses ini terjadi di approval final/level terakhir)*

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

**Tidak ada gambar tanda tangan yang ditambahkan ke PDF.**

---

# 10. QR Code

*(Tidak berubah dari v1.1)*

QR Code berisi URL verifikasi, bukan seluruh informasi surat.

```text
QR → /verify/{token} → Cari Surat → Validasi Status → Validasi Integritas → Tampilkan Informasi
```

---

# 11. Keamanan

## 11.1 Authentication
- Password di-hash.
- Session authentication.
- Role-based authorization.
- Session timeout.

## 11.2 Authorization

```text
Sekretaris Yayasan
   ❌ approve

Sekretaris Lembaga
   ❌ approve

Kepala Lembaga
   ✓ approve (hanya level 1, hanya untuk surat dari lembaganya sendiri)
   ❌ approve surat dari Lembaga lain

Admin
   ❌ approve
   ❌ membuat disposisi

Approver (Gus)
   ✓ approve (level final)
   ✓ membuat & mengelola disposisi
```

### FR-Auth-1 *(baru)*
Kepala Lembaga tidak dapat mengakses atau melakukan aksi apapun terhadap surat maupun disposisi milik Lembaga lain — pembatasan dilakukan berdasarkan pencocokan `lembaga_id` milik user dengan `lembaga_id` pada resource terkait.

## 11.3 Verification Token
- unik
- tidak mudah ditebak
- tidak menggunakan ID database secara langsung
- tidak dapat digunakan untuk mengubah dokumen

## 11.4 Audit Trail
```text
UPLOAD
SUBMIT
APPROVED (per level)
REJECTED (per level)
DOWNLOADED
VERIFIED
DISPOSISI_DIBUAT
DISPOSISI_DIBACA
DISPOSISI_DITINDAKLANJUTI
```

---

# 12. Integritas Dokumen

*(Tidak berubah dari v1.1)*

```text
PDF FINAL → SHA-256 → surats.file_hash
```

---

# 13. Business Rules

1. Nomor surat tidak pernah diberikan sebelum surat disetujui **pada step final**.
2. Satu kombinasi `jenis_surat_id + tahun` hanya memiliki satu counter (berlaku Yayasan-wide, lintas Lembaga).
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
13. Setelah surat disetujui **pada step final**, `file_final` tidak dapat diubah.
14. Jika surat perlu direvisi setelah disetujui, harus melalui proses surat baru/revisi sesuai workflow.
15. Setiap perubahan status surat wajib dicatat pada `approval_logs`, termasuk levelnya.
16. Verification token tidak boleh digunakan untuk memodifikasi surat.
17. `file_hash` merepresentasikan hash PDF final yang telah disimpan.
18. **Surat yang diajukan Sekretaris Lembaga wajib melalui persetujuan Kepala Lembaga terkait sebelum diteruskan ke Gus.**
19. **Surat yang diajukan Sekretaris Yayasan langsung menuju approval Gus tanpa melalui Kepala Lembaga.**
20. **Approval step tidak dapat dilompati (skip level) — surat hanya dapat diproses oleh approver pada level yang sedang aktif (`current_level`).**
21. **Jika surat ditolak pada level manapun, seluruh proses berhenti dan status surat menjadi `ditolak`; surat tidak diteruskan ke level berikutnya.**
22. **Nomor surat, QR Code, dan hash hanya digenerate setelah step approval terakhir dalam rantai (Gus) disetujui — bukan pada step antara (Kepala Lembaga).**
23. **Kepala Lembaga hanya berwenang atas surat dan disposisi yang terkait dengan Lembaganya sendiri.**
24. **Satu disposisi dapat memiliki lebih dari satu Lembaga tujuan; status tindak lanjut dicatat secara independen per Lembaga.**
25. **Disposisi bersifat satu arah (Gus → Lembaga) dan tidak dapat diteruskan/didisposisikan ulang oleh Kepala Lembaga penerima pada fase ini.**
26. **Status agregat disposisi (`disposisis.status`) dihitung otomatis dari status seluruh target Lembaga, bukan diinput manual.**

---

# 14. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | Password di-hash, RBAC (termasuk pembatasan lintas-Lembaga), validasi upload PDF |
| **Audit** | Semua aksi approval & disposisi tercatat dengan timestamp dan user_id |
| **Ketersediaan** | Sistem responsive dan dapat digunakan melalui mobile browser, termasuk oleh Kepala Lembaga |
| **Performa** | Generate QR dan stamping PDF selesai dalam hitungan detik; perpindahan antar-level approval terjadi secara real-time (tanpa delay signifikan) |
| **Kompatibilitas** | PDF final dapat dibuka pada PDF viewer standar |
| **Scalability** | Counter nomor berdasarkan tahun dan jenis surat; struktur `approval_steps` mendukung penambahan jumlah Lembaga tanpa migrasi skema |
| **Usability** | PDF Placement Editor mudah digunakan; status/step approval dan status disposisi mudah dipahami secara visual (mis. melalui stepper/badge) |
| **Integrity** | PDF final memiliki SHA-256 hash untuk pemeriksaan integritas dokumen |

---

# 15. User Experience — PDF Placement Editor

*(Tidak berubah dari v1.1)*

```text
┌──────────────────────────────────────────────────────┐
│                PDF PLACEMENT EDITOR                  │
├──────────────────────────────────────────────────────┤
│              ┌─────────────────────┐                 │
│              │      ISI SURAT      │                 │
│              │              ┌────┐ │                 │
│              │              │ QR │ │                 │
│              │              └────┘ │                 │
│              └─────────────────────┘                 │
├──────────────────────────────────────────────────────┤
│ Halaman: 1 / 2                                       │
│ [Reset Posisi]                    [Simpan Posisi]    │
└──────────────────────────────────────────────────────┘
```

---

# 16. Template Posisi QR

*(Tidak berubah dari v1.1)*

```text
Surat A.1 → Page 1 → kanan bawah
Surat A.2 → Page 1 → kanan bawah
Surat B.1 → Page 2 → kiri bawah
```

Default tidak bersifat wajib. Sekretaris tetap dapat menyesuaikannya pada PDF Placement Editor.

---

# 17. Status Surat & Disposisi

## 17.1 Status Surat (diperbarui — menampilkan step aktif)

```text
DRAFT
   │
   ▼
MENUNGGU_PERSETUJUAN (current_level = 1)
   │
   ├── [Surat Lembaga] Kepala Lembaga menyetujui → current_level = 2 → menunggu Gus
   │                                                       │
   │                                                   ┌───┴───┐
   │                                                   ▼       ▼
   │                                               DITOLAK   DISETUJUI
   │
   └── [Surat Yayasan / setelah disetujui Kepala Lembaga] Gus memutuskan
                     │
                 ┌───┴───┐
                 ▼       ▼
             DITOLAK   DISETUJUI
                           │
                           ▼
                       PDF FINAL
                           │
                           ▼
                         ARSIP
```

## 17.2 Status Disposisi *(baru)*

Status per Lembaga (`disposisi_targets.status`):
```text
BELUM_DIBACA → DIBACA → DIPROSES → SELESAI
```

Status agregat (`disposisis.status`), dihitung otomatis:
```text
TERKIRIM  →  SELESAI_SEBAGIAN  →  SELESAI
```

---

# 18. Halaman Verifikasi Publik

*(Tidak berubah dari v1.1)*

```text
╔══════════════════════════════════════╗
║       ✓ DOKUMEN TERVERIFIKASI        ║
║       Yayasan PISSYA                 ║
║ Nomor Surat                          ║
║ A.2-59/YA-PISSYA/VIII/2026           ║
║ Jenis Surat                          ║
║ Surat Undangan                       ║
║ Perihal                              ║
║ Undangan Kegiatan                    ║
║ Disetujui Oleh                       ║
║ Gus / Ketua Yayasan                  ║
║ Tanggal Approval                     ║
║ 09 Agustus 2026                      ║
║ Status                               ║
║ ✓ AKTIF                              ║
║ Integritas Dokumen                   ║
║ ✓ SESUAI                             ║
║ [ DOWNLOAD DOKUMEN ]                 ║
╚══════════════════════════════════════╝
```

> Halaman verifikasi publik tidak menampilkan riwayat approval berjenjang (Kepala Lembaga) maupun disposisi — informasi tersebut bersifat internal dan hanya ditampilkan pada dashboard internal sistem.

---

# 19. Kriteria Penerimaan

## 19.1 Approval Berjenjang *(baru)*
- [ ] Admin dapat membuat data Lembaga.
- [ ] Admin dapat membuat user dengan role Sekretaris Lembaga/Kepala Lembaga yang terikat ke satu Lembaga.
- [ ] Surat yang diajukan Sekretaris Lembaga otomatis membuat 2 approval step (Kepala Lembaga → Gus).
- [ ] Surat yang diajukan Sekretaris Yayasan otomatis membuat 1 approval step (Gus).
- [ ] Kepala Lembaga hanya melihat surat dari Lembaganya sendiri.
- [ ] Kepala Lembaga tidak dapat mengakses/approve surat dari Lembaga lain.
- [ ] Surat Lembaga tidak muncul di daftar Gus sebelum disetujui Kepala Lembaga.
- [ ] Jika Kepala Lembaga menolak, surat berstatus `ditolak` dan tidak diteruskan ke Gus.
- [ ] Jika Kepala Lembaga menyetujui, surat otomatis muncul di daftar Gus.
- [ ] Nomor surat, QR Code, dan hash **hanya** dibuat setelah persetujuan Gus (step final), bukan setelah persetujuan Kepala Lembaga.
- [ ] Riwayat/log approval menampilkan aksi dari kedua level dengan jelas (siapa, kapan, level berapa).

## 19.2 Disposisi *(baru)*
- [ ] Gus dapat membuat disposisi baru dengan perihal dan isi arahan.
- [ ] Gus dapat memilih lebih dari satu Lembaga sebagai tujuan dalam satu disposisi.
- [ ] Setiap Lembaga tujuan mendapat entri status independen (`disposisi_targets`).
- [ ] Kepala Lembaga hanya melihat disposisi yang ditujukan ke Lembaganya.
- [ ] Status disposisi berubah menjadi "dibaca" otomatis saat pertama kali dibuka Kepala Lembaga.
- [ ] Kepala Lembaga dapat mengubah status menjadi "diproses"/"selesai" dengan catatan tindak lanjut.
- [ ] Gus dapat melihat rincian status disposisi per Lembaga tujuan dalam satu tampilan.
- [ ] Status agregat disposisi terhitung otomatis dan sesuai dengan status seluruh target.
- [ ] Disposisi dapat dibuat dengan atau tanpa merujuk ke surat tertentu.

## 19.3 Umum *(tidak berubah dari v1.1)*
- [ ] Sekretaris dapat login, mengunggah PDF, mengisi metadata, melihat preview, membuka PDF Placement Editor.
- [ ] Sekretaris dapat drag & drop dan resize QR; posisi tersimpan dan konsisten meski viewport berubah.
- [ ] Gus dapat melihat, menyetujui, dan menolak surat dari perangkat mobile.
- [ ] Nomor surat hanya dibuat setelah approval final dan tidak mengalami duplikasi.
- [ ] Sistem menghasilkan verification token dan QR Code yang valid.
- [ ] PDF final hanya memiliki QR Code sebagai elemen verifikasi, tanpa gambar tanda tangan.
- [ ] Tidak terdapat tabel/model `signatures` pada database.
- [ ] QR Code dapat dipindai kamera smartphone dan mengarah ke halaman verifikasi yang benar.
- [ ] Halaman verifikasi dapat diakses tanpa login dan menampilkan informasi surat yang benar.
- [ ] Halaman verifikasi dapat memeriksa integritas PDF berdasarkan SHA-256.
- [ ] PDF final dapat di-download dan tidak dapat diubah melalui sistem.
- [ ] Semua approval tercatat di `approval_logs`.
- [ ] Hash PDF final tersimpan pada `surats.file_hash`.

---

# 20. Pengembangan Masa Depan

Fase berikutnya dapat menambahkan:

### TTE Tersertifikasi
```text
Sistem E-Surat → PSrE → Sertifikat Elektronik → PDF Digital Signed
```

### Pengembangan lain
- Notifikasi WhatsApp / Telegram / Email untuk setiap perpindahan level approval dan disposisi baru.
- Approval berjenjang lebih dari 2 level (mis. penambahan Kepala Bidang di antara Kepala Lembaga dan Gus).
- Disposisi berjenjang (Kepala Lembaga dapat meneruskan disposisi ke staf/sub-unit di bawahnya).
- Template surat.
- OCR.
- Digital certificate & PAdES.
- Timestamp server.
- Revocation.
- Dashboard statistik (termasuk statistik waktu tindak lanjut disposisi per Lembaga).
- Mobile application.

Integrasi tersebut tidak termasuk dalam versi 1.2.