<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'student_profiles';


    protected $primaryKey = 'user_id';
    public $incrementing = false;


    protected $appends = ['current_semester_level'];
    protected $fillable = [
        'user_id',
        'student_number',
        'program_id',
        'semester_id',
        'batch_year',
        'gpa',
    ];

    /**
     * ACCESSOR: Menghitung Semester Berjalan secara Otomatis
     */
    public function getCurrentSemesterLevelAttribute()
    {
        $activeSemester = Semester::where('is_active', true)->first();

        if (!$activeSemester) return 1;

        $currentYear = (int) substr($activeSemester->academic_year, 0, 4);
        $batchYear = (int) $this->batch_year;

        $yearDiff = $currentYear - $batchYear;

        $termValue = ($activeSemester->term == 'Ganjil') ? 1 : 2;

        $semesterLevel = ($yearDiff * 2) + $termValue;

        return max(1, $semesterLevel);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }
}
