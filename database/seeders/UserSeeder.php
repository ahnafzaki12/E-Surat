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
        $approverRole = DB::table('roles')->where('name', 'approver')->first();
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        
        $now = now();

        DB::table('users')->insert([
            [
                'role_id' => $sekretarisRole->id ?? 1,
                'name' => 'Sekretaris',
                'email' => 'sekretaris@example.com',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => $approverRole->id ?? 2,
                'name' => 'Gus Approver',
                'email' => 'gus@example.com',
                'password' => Hash::make('password'),
                'phone' => '081234567891',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'role_id' => $adminRole->id ?? 3,
                'name' => 'Administrator',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'phone' => '081234567892',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);
    }
}
