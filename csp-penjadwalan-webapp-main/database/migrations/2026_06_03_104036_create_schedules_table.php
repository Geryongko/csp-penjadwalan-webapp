<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id('schedule_id');
            $table->foreignId('student_class_id')->constrained('student_classes', 'student_class_id')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects', 'subject_id')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms', 'room_id')->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 1 = Monday, 5 = Friday
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
