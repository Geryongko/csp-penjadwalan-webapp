<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    use HasFactory;

    protected $primaryKey = 'time_slot_id';

    protected $fillable = [
        'slot_number',
        'start_time',
        'end_time',
        'is_break',
        'name',
    ];
}
