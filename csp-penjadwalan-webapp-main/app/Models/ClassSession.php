<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSession extends Model
{
    use HasFactory;

    protected $primaryKey = 'session_id';

    protected $fillable = [
        'student_class_id',
        'assignment_id',
        'session_number',
        'session_date',
        'topic',
        'zoom_link',
        'is_online'
    ];

    protected $casts = [
        'session_date' => 'date',
        'is_online' => 'boolean'
    ];

    public function teachingAssignment()
    {
        return $this->belongsTo(TeachingAssignment::class, 'assignment_id', 'assignment_id');
    }

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class, 'student_class_id', 'student_class_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'session_id', 'session_id');
    }
}
