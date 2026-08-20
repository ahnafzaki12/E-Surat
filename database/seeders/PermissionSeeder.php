<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['group' => 'Dashboard', 'key' => 'dashboard.view', 'label' => 'Lihat Dashboard'],
            ['group' => 'Daftar Surat', 'key' => 'surat.index', 'label' => 'Lihat Daftar Surat'],
            ['group' => 'Daftar Surat', 'key' => 'surat.create', 'label' => 'Buat/Upload Surat'],
            ['group' => 'Daftar Surat', 'key' => 'surat.show', 'label' => 'Lihat Detail Surat'],
            ['group' => 'Daftar Surat', 'key' => 'surat.preview', 'label' => 'Preview PDF Draft'],
            ['group' => 'Daftar Surat', 'key' => 'surat.placement', 'label' => 'Atur Posisi QR (Placement Editor)'],
            ['group' => 'Daftar Surat', 'key' => 'surat.submit', 'label' => 'Ajukan Surat ke Approval'],
            ['group' => 'Daftar Surat', 'key' => 'surat.approve', 'label' => 'Setujui/Tolak Surat'],
            ['group' => 'Daftar Surat', 'key' => 'surat.replace-file', 'label' => 'Ganti File Draft (Revisi Surat Ditolak)'],
            ['group' => 'Manajemen Pengguna', 'key' => 'users.index', 'label' => 'Lihat Daftar User'],
            ['group' => 'Manajemen Pengguna', 'key' => 'users.create', 'label' => 'Tambah User'],
            ['group' => 'Manajemen Pengguna', 'key' => 'users.edit', 'label' => 'Edit User'],
            ['group' => 'Manajemen Pengguna', 'key' => 'users.delete', 'label' => 'Hapus User'],
            ['group' => 'Peran', 'key' => 'roles.index', 'label' => 'Lihat Daftar Peran'],
            ['group' => 'Peran', 'key' => 'roles.create', 'label' => 'Tambah Peran'],
            ['group' => 'Peran', 'key' => 'roles.edit', 'label' => 'Edit Peran & Hak Akses'],
            ['group' => 'Peran', 'key' => 'roles.delete', 'label' => 'Hapus Peran'],
            ['group' => 'Jenis Surat', 'key' => 'classifications.index', 'label' => 'Lihat Daftar Jenis Surat'],
            ['group' => 'Jenis Surat', 'key' => 'classifications.create', 'label' => 'Tambah Jenis Surat'],
            ['group' => 'Jenis Surat', 'key' => 'classifications.edit', 'label' => 'Edit Jenis Surat'],
            ['group' => 'Jenis Surat', 'key' => 'classifications.delete', 'label' => 'Hapus Jenis Surat'],
            ['group' => 'Lembaga', 'key' => 'stations.index', 'label' => 'Lihat Daftar Lembaga'],
            ['group' => 'Lembaga', 'key' => 'stations.create', 'label' => 'Tambah Lembaga'],
            ['group' => 'Lembaga', 'key' => 'stations.edit', 'label' => 'Edit Lembaga'],
            ['group' => 'Lembaga', 'key' => 'stations.delete', 'label' => 'Hapus Lembaga'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['key' => $permission['key']], $permission);
        }
    }
}
