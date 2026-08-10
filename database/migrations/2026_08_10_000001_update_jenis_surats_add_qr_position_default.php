<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Menambahkan field qr_position_default ke tabel jenis_surats
     * sesuai ERD PRD V1.1 (FR-16: posisi default TTE Badge per jenis surat).
     */
    public function up(): void
    {
        Schema::table('jenis_surats', function (Blueprint $table) {
            // Posisi default TTE Badge (QR Code) untuk jenis surat ini.
            // Disimpan dalam format JSON sama dengan field qr_position pada tabel surats.
            // Nullable karena tidak semua jenis surat memiliki posisi default.
            // Contoh: {"page": 1, "x": 0.72, "y": 0.78, "width": 0.26, "height": 0.10}
            $table->json('qr_position_default')->nullable()->after('deskripsi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jenis_surats', function (Blueprint $table) {
            $table->dropColumn('qr_position_default');
        });
    }
};
