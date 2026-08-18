<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sekretarisRole = DB::table('roles')->where('name', 'sekretaris')->first();
        $approverRole   = DB::table('roles')->where('name', 'approver')->first();
        $adminRole      = DB::table('roles')->where('name', 'admin')->first();

        // Ambil lembaga Yayasan
        $yayasan = DB::table('lembagas')->where('lemb_name', 'Yayasan')->first();

        $now = now();

        DB::table('users')->upsert([
            [
                'role_id'    => $sekretarisRole->id ?? 1,
                'lemb_id'    => $yayasan->lemb_id ?? null,
                'name'       => 'Sekretaris Yayasan',
                'email'      => 'sekretaris@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '081234567890',
                'status'     => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id'    => $approverRole->id ?? 2,
                'lemb_id'    => null,
                'name'       => 'Gus Approver',
                'email'      => 'gus@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '081234567891',
                'status'     => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id'    => $adminRole->id ?? 3,
                'lemb_id'    => null,
                'name'       => 'Administrator',
                'email'      => 'admin@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '081234567892',
                'status'     => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['email'], ['role_id', 'lemb_id', 'name', 'phone', 'status', 'updated_at']);
    }
}
