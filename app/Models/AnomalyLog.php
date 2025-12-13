<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnomalyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'severity',
        'description',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
    ];
}
