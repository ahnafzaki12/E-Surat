<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LembagaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        DB::table('lembagas')->insert([
            [
                'lemb_name'  => 'Yayasan',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
