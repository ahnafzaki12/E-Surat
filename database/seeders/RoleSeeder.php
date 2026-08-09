<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $roles = [
            ['name' => 'sekretaris', 'description' => 'Sekretaris pembuat surat', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'approver', 'description' => 'Penyetuju surat (Gus)', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'admin', 'description' => 'Administrator sistem', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('roles')->insert($roles);
    }
}
