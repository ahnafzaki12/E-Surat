<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jenis_surats', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'pakai_bulan_romawi', 'qr_position_default']);
        });
    }

    public function down(): void
    {
        Schema::table('jenis_surats', function (Blueprint $table) {
            $table->enum('kategori', ['umum', 'khusus'])->default('umum');
            $table->boolean('pakai_bulan_romawi')->default(true);
            $table->json('qr_position_default')->nullable();
        });
    }
};
