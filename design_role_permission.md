# Desain Role & Permission Management
# Sistem E-Surat Yayasan PISSYA

| | |
|---|---|
| **Terkait** | Fitur CRUD Role dengan checkbox hak akses menu (Role Management) |
| **Disesuaikan dengan** | Route terbaru (`web.php`) — Controller: `SuratController`, `UserController`, `RoleController`, `JenisSuratController`, `LembagaController` |
| **Perubahan dari versi sebelumnya** | Role **`kepala_lembaga` dihapus** (tidak ada approval berjenjang lagi — alur kembali 1 level, langsung ke `approver`/Gus). Role **`sekretaris` dipecah menjadi 2**: `sekretaris_yayasan` (akses semua menu) dan `sekretaris_lembaga` (hanya menu Surat, dibatasi ke lembaganya sendiri, tanpa akses Dashboard & menu sistem). |

---

## 1. Perubahan Konteks Penting

Karena role `kepala_lembaga` sudah dihapus, **alur approval kembali sederhana (1 level)**:

```text
Sekretaris Yayasan / Sekretaris Lembaga → ajukan surat → Approver (Gus) → disetujui/ditolak
```

Field `lembaga_id` pada tabel `surats` **tetap dipertahankan**, tapi fungsinya berubah:
- ❌ Bukan lagi penentu jalur approval berjenjang.
- ✅ Hanya sebagai **data scope** — untuk membatasi surat mana saja yang boleh dilihat oleh `sekretaris_lembaga` (hanya lembaganya sendiri), dan sebagai informasi konteks bagi Gus saat meninjau surat (surat ini berasal dari lembaga mana).

> Konsekuensinya: tabel `approval_steps` yang sempat dirancang untuk multi-level approval **tidak lagi diperlukan** dengan struktur route saat ini. Kalau kamu mau, PRD (v1.2) juga perlu di-update supaya konsisten dengan keputusan ini — beri tahu saya kalau mau saya revisi sekalian.

---

## 2. Struktur Role Terbaru

| Role | Akses Dashboard | Akses Daftar Surat | Akses Menu Sistem (Users/Roles/Jenis Surat/Lembaga) | Cakupan Data Surat |
|---|:---:|:---:|:---:|---|
| **`sekretaris_yayasan`** | ✅ | ✅ (kecuali approve) | ✅ Semua menu | Semua surat (tidak dibatasi lembaga) |
| **`sekretaris_lembaga`** | ❌ | ✅ (kecuali approve) | ❌ Tidak ada | **Hanya surat dengan `lembaga_id` = lembaganya sendiri** |
| **`approver`** (Gus) | ✅ | ✅ (khusus approve/reject) | ❌ Tidak ada | Semua surat yang berstatus menunggu persetujuan |
| **`admin`** | ✅ | ✅ (lihat saja, opsional) | ✅ Semua menu | Semua surat |

---

## 3. Pemetaan Menu Sidebar → Resource/Controller

*(Tidak berubah — tetap mengacu ke route yang sama)*

| Menu di Sidebar | Controller | Prefix Route |
|---|---|---|
| Dashboard | *(inline closure di web.php)* | `/` |
| Daftar Surat | `SuratController` | `surat` |
| Manajemen Pengguna | `UserController` | `users` |
| Peran | `RoleController` | `roles` |
| Jenis Surat | `JenisSuratController` | `classifications` |
| Lembaga | `LembagaController` | `stations` |

---

## 4. Struktur Database Permission

*(Tidak berubah dari desain sebelumnya)*

### `permissions`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| key | string, unique | Pola `{resource}.{aksi}`, mis. `surat.approve` |
| label | string | Nama tampil di UI checkbox |
| group | string | Nama grup di UI (pakai nama sidebar) |

### `role_permissions`

| Field | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| role_id | FK → roles | |
| permission_id | FK → permissions | |

Constraint: `UNIQUE(role_id, permission_id)`

---

## 5. Daftar Permission Lengkap (Tidak Berubah dari Versi Sebelumnya)

### Group: Dashboard
| Key | Label |
|---|---|
| `dashboard.view` | Lihat Dashboard |

### Group: Daftar Surat
| Key | Label |
|---|---|
| `surat.index` | Lihat Daftar Surat |
| `surat.create` | Buat/Upload Surat |
| `surat.show` | Lihat Detail Surat |
| `surat.preview` | Preview PDF Draft |
| `surat.placement` | Atur Posisi QR (Placement Editor) |
| `surat.submit` | Ajukan Surat ke Approval |
| `surat.approve` | Setujui/Tolak Surat |
| `surat.replace-file` | Ganti File Draft (Revisi Surat Ditolak) |

### Group: Manajemen Pengguna
| Key | Label |
|---|---|
| `users.index` | Lihat Daftar User |
| `users.create` | Tambah User |
| `users.edit` | Edit User |
| `users.delete` | Hapus User |

### Group: Peran
| Key | Label |
|---|---|
| `roles.index` | Lihat Daftar Peran |
| `roles.create` | Tambah Peran |
| `roles.edit` | Edit Peran & Hak Akses |
| `roles.delete` | Hapus Peran |

### Group: Jenis Surat
| Key | Label |
|---|---|
| `classifications.index` | Lihat Daftar Jenis Surat |
| `classifications.create` | Tambah Jenis Surat |
| `classifications.edit` | Edit Jenis Surat |
| `classifications.delete` | Hapus Jenis Surat |

### Group: Lembaga
| Key | Label |
|---|---|
| `stations.index` | Lihat Daftar Lembaga |
| `stations.create` | Tambah Lembaga |
| `stations.edit` | Edit Lembaga |
| `stations.delete` | Hapus Lembaga |

---

## 6. Matriks Default per Role (Seeder) — **Diperbarui**

| Permission | sekretaris_yayasan | sekretaris_lembaga | approver | admin |
|---|:---:|:---:|:---:|:---:|
| dashboard.view | ✅ | ❌ | ✅ | ✅ |
| surat.index | ✅ | ✅ | ✅ | ✅ |
| surat.create | ✅ | ✅ | ❌ | ✅ |
| surat.show | ✅ | ✅ | ✅ | ✅ |
| surat.preview | ✅ | ✅ | ✅ | ✅ |
| surat.placement | ✅ | ✅ | ❌ | ✅ |
| surat.submit | ✅ | ✅ | ❌ | ✅ |
| surat.approve | ❌ | ❌ | ✅ | ❌ |
| surat.replace-file | ✅ | ✅ | ❌ | ✅ |
| users.* | ✅ | ❌ | ❌ | ✅ |
| roles.* | ✅ | ❌ | ❌ | ✅ |
| classifications.* | ✅ | ❌ | ❌ | ✅ |
| stations.* | ✅ | ❌ | ❌ | ✅ |

> **Asumsi yang saya ambil:** "Sekretaris Yayasan bisa akses semua menu" saya artikan sebagai akses penuh ke seluruh menu sistem **kecuali** `surat.approve` (karena approve tetap harus jadi kewenangan eksklusif Gus, sesuai prinsip pemisahan tugas/segregation of duty). Kalau maksud kamu "semua menu" termasuk approve juga, tinggal beri tanda ✅ di baris itu — tapi saya sarankan tetap dipisah demi keamanan proses.

---

## 7. Wireframe Halaman Add/Edit Role

Struktur tetap sama seperti sebelumnya (per grup + checkbox), hanya kini `sekretaris_lembaga` sebagai contoh akan terlihat seperti ini saat di-edit:

```
┌──────────────────────────────────────────────────────────┐
│  Edit Role: sekretaris_lembaga                             │
├──────────────────────────────────────────────────────────┤
│  Role Name    [ sekretaris_lembaga__ ]                     │
│  Description  [ Sekretaris pembuat surat tingkat lembaga ] │
├──────────────────────────────────────────────────────────┤
│  Hak Akses Menu & Fitur                                   │
│                                                            │
│  ▸ Dashboard                          [ Pilih Semua ]      │
│     ☐ Lihat Dashboard                                      │
│                                                            │
│  ▸ Daftar Surat                       [ Pilih Semua ]      │
│     ☑ Lihat Daftar Surat                                   │
│     ☑ Buat/Upload Surat                                    │
│     ☑ Lihat Detail Surat                                   │
│     ☑ Preview PDF Draft                                    │
│     ☑ Atur Posisi QR (Placement Editor)                    │
│     ☑ Ajukan Surat ke Approval                             │
│     ☐ Setujui/Tolak Surat                                  │
│     ☑ Ganti File Draft (Revisi Surat Ditolak)               │
│                                                            │
│  ▸ Manajemen Pengguna                 [ Pilih Semua ]      │
│     ☐ (semua tidak dicentang)                              │
│                                                            │
│  ▸ Peran                              [ Pilih Semua ]      │
│     ☐ (semua tidak dicentang)                              │
│                                                            │
│  ▸ Jenis Surat                        [ Pilih Semua ]      │
│     ☐ (semua tidak dicentang)                              │
│                                                            │
│  ▸ Lembaga                            [ Pilih Semua ]      │
│     ☐ (semua tidak dicentang)                              │
│                                                            │
│                                    [ Batal ]  [ Simpan ]   │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Middleware — Penerapan ke Route

*(Pola sama seperti sebelumnya, tidak berubah)*

```php
Route::post('surat/{surat}/approve', [SuratController::class, 'approve'])
    ->name('surat.approve')
    ->middleware('permission:surat.approve');

Route::post('surat/{surat}/reject', [SuratController::class, 'reject'])
    ->name('surat.reject')
    ->middleware('permission:surat.approve'); // pakai key yang sama
```

Untuk route grup System Setting (`users`, `roles`, `classifications`, `stations`), tambahkan middleware permission per-resource, misalnya:

```php
Route::resource('users', UserController::class)
    ->middleware('permission:users.index'); // atau pecah per method jika perlu lebih granular
```

---

## 9. Dua Lapis Pembatasan yang Wajib Diterapkan Bersamaan

Ini bagian **paling penting** untuk kasus `sekretaris_lembaga` kamu — checkbox permission saja **tidak cukup**. Ada 3 lapis yang harus jalan bareng:

### Lapis 1 — Permission (dari halaman Role Management)
Menentukan **fitur/aksi** apa saja yang boleh diakses role tersebut (mis. `sekretaris_lembaga` punya `surat.create` tapi tidak punya `surat.approve`).

### Lapis 2 — Sidebar Visibility
Menu yang **tidak dimiliki permission-nya harus disembunyikan** dari sidebar, bukan cuma diblokir di route. Untuk `sekretaris_lembaga`, secara otomatis sidebar-nya hanya akan menampilkan menu **"Daftar Surat"** saja (karena Dashboard dan 4 menu sistem tidak punya permission apa pun) — ini didapat gratis kalau sidebar-nya sudah dirender berdasarkan permission user yang login, tidak perlu logic tambahan khusus per role.

### Lapis 3 — Data Scope (Query Filtering) — **wajib ditambahkan manual di controller**
Ini yang **tidak** bisa diselesaikan lewat checkbox permission. Di `SuratController@index` (dan `show`), tambahkan filter:

```php
// Contoh logic di SuratController@index
$query = Surat::query();

if (auth()->user()->role->name === 'sekretaris_lembaga') {
    $query->where('lembaga_id', auth()->user()->lembaga_id);
}

// sekretaris_yayasan, approver, admin -> tidak difilter (lihat semua)
```

Tanpa lapis ini, meskipun sidebar & permission sudah benar, seorang `sekretaris_lembaga` tetap bisa saja mengakses `surat.show` milik lembaga lain hanya dengan mengganti ID surat di URL. **Ini celah keamanan paling umum kalau lapis 3 terlewat**, jadi wajib diuji secara khusus saat testing (coba akses `/surat/{id}` milik lembaga lain secara langsung, pastikan ditolak/403).

---

## 10. Ringkasan Perubahan dari Versi Sebelumnya

| Item | Versi Lama | Versi Baru |
|---|---|---|
| Role `kepala_lembaga` | Ada, approval level 1 | **Dihapus** |
| Approval | 2 level (Lembaga → Yayasan) | **Kembali 1 level (langsung ke Gus)** |
| Role `sekretaris` | 1 role untuk semua sekretaris | **Dipecah jadi `sekretaris_yayasan` & `sekretaris_lembaga`** |
| Akses Dashboard | Semua role dengan `dashboard.view` | **`sekretaris_lembaga` tidak diberi akses Dashboard** |
| Akses menu sistem | Diatur per permission individual | **`sekretaris_lembaga` sama sekali tidak diberi permission menu sistem** |
| Data scope surat | Berdasarkan step approval aktif | **Berdasarkan `lembaga_id` langsung (khusus `sekretaris_lembaga`)** |

---

## 11. Rekomendasi Tindak Lanjut

Karena `kepala_lembaga` dan approval berjenjang dihapus, dokumen **PRD v1.2** yang sebelumnya sudah dibuat (berisi tabel `approval_steps`, alur 2 level, dsb.) **sudah tidak sinkron** dengan arah sistem terbaru ini. Beri tahu saya kalau kamu ingin saya buatkan **PRD v1.3** yang menyesuaikan — intinya menghapus bagian approval berjenjang & role `kepala_lembaga`, tapi tetap mempertahankan field `lembaga_id` untuk keperluan data-scope seperti dijelaskan di Bab 1 dokumen ini.