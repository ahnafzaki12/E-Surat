<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_id')->constrained('surats');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('aksi', ['diajukan', 'disetujui', 'ditolak']);
            $table->text('catatan')->nullable();
            // Audit log bersifat immutable — hanya created_at sesuai ERD PRD V1.1
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
    }
};
