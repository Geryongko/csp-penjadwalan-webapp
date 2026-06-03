<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rombel extends Model
{
    use HasFactory;

    protected $primaryKey = 'rombel_id';

    protected $fillable = [
        'rombel_name',
        'grade_level',
        'program_id',
        'homeroom_teacher_id',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id', 'user_id');
    }
}
