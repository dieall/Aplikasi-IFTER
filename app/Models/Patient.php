<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'mrn',
        'name',
        'dob',
        'phone',
        'insurance_number',
        'address',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'dob' => 'date',
        'notes' => 'encrypted',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
