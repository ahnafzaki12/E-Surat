<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Surat extends Model
{
    protected $table = 'surats';

    protected $fillable = [
        'jenis_surat_id',
        'nomor_surat_id',
        'nomor_surat_formatted',
        'perihal',
        'tujuan_surat',
        'tanggal_surat',
        'file_draft',
        'file_final',
        'qr_position',
        'verification_token',
        'file_hash',
        'status',
        'catatan_penolakan',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'file_draft'   => 'array',
        'file_final'   => 'array',
        'qr_position'  => 'array',
        'tanggal_surat' => 'date',
        'approved_at'  => 'datetime',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function jenisSurat()
    {
        return $this->belongsTo(JenisSurat::class, 'jenis_surat_id');
    }

    public function nomorSurat()
    {
        return $this->belongsTo(NomorSurat::class, 'nomor_surat_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvalLogs()
    {
        return $this->hasMany(ApprovalLog::class, 'surat_id');
    }

    // ── Helpers ─────────────────────────────────────────────

    /**
     * Label status yang ramah untuk ditampilkan.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft'                 => 'Draft',
            'menunggu_persetujuan'  => 'Menunggu Persetujuan',
            'ditolak'               => 'Ditolak',
            'disetujui'             => 'Disetujui',
            default                 => ucfirst($this->status),
        };
    }
}
