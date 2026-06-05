<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $primaryKey = 'attendance_id';
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'student_id',
        'status',
        'note'
    ];

    public function classSession()
    {
        return $this->belongsTo(ClassSession::class, 'session_id', 'session_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id', 'user_id');
    }
}
