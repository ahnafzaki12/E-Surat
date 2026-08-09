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
        Schema::create('surats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jenis_surat_id')->constrained('jenis_surats');
            $table->foreignId('nomor_surat_id')->nullable()->constrained('nomor_surats');
            $table->string('nomor_surat_formatted')->nullable();
            $table->string('perihal');
            $table->text('tujuan_surat');
            $table->date('tanggal_surat');
            $table->json('file_draft');
            $table->json('file_final')->nullable();
            $table->enum('status', ['draft', 'menunggu_persetujuan', 'ditolak', 'disetujui'])->default('draft');
            $table->text('catatan_penolakan')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surats');
    }
};
