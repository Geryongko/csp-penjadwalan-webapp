<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeachingAssignment extends Model
{
    use HasFactory;

    protected $primaryKey = 'assignment_id';
    
    protected $fillable = [
        'teacher_id',
        'subject_id',
        'student_class_id',
        'academic_year',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id', 'user_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'subject_id');
    }

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class, 'student_class_id', 'student_class_id');
    }

    public function classSessions()
    {
        return $this->hasMany(ClassSession::class, 'assignment_id', 'assignment_id');
    }
}
