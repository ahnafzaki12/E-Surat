<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class JenisSuratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $jenisSurats = [
            ['kode' => 'A.1', 'nama' => 'Surat Keputusan', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Keputusan', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'A.2', 'nama' => 'Surat Undangan', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Undangan', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'A.3', 'nama' => 'Surat Permohonan', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Permohonan', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'A.4', 'nama' => 'Surat Pemberitahuan', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Pemberitahuan', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'A.5', 'nama' => 'Surat Pengantar', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Pengantar', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'A.6', 'nama' => 'Surat Mandat/Tugas', 'kategori' => 'umum', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Mandat/Tugas', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'B.1', 'nama' => 'Surat Keterangan', 'kategori' => 'khusus', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Keterangan', 'created_at' => $now, 'updated_at' => $now],
            ['kode' => 'B.2', 'nama' => 'Surat Rekomendasi', 'kategori' => 'khusus', 'pakai_bulan_romawi' => true, 'deskripsi' => 'Surat Rekomendasi', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('jenis_surats')->insert($jenisSurats);
    }
}
