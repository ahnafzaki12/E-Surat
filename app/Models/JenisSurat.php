<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisSurat extends Model
{
    protected $table = 'jenis_surats';

    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
    ];

    /**
     * Surat-surat yang menggunakan jenis surat ini.
     */
    public function surats()
    {
        return $this->hasMany(Surat::class, 'jenis_surat_id');
    }

    /**
     * Counter nomor surat per tahun untuk jenis surat ini.
     */
    public function nomorSurats()
    {
        return $this->hasMany(NomorSurat::class, 'jenis_surat_id');
    }
}
