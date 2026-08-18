<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lembaga extends Model
{
    protected $primaryKey = 'lemb_id';
    
    protected $fillable = [
        'lemb_name',
    ];
}
