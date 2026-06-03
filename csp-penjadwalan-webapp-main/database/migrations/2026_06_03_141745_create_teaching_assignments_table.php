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
        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id('assignment_id');
            $table->foreignId('teacher_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects', 'subject_id')->cascadeOnDelete();
            $table->foreignId('student_class_id')->constrained('student_classes', 'student_class_id')->cascadeOnDelete();
            $table->string('academic_year')->default('2026/2027');
            $table->timestamps();

            // Prevent assigning same subject to same class multiple times
            $table->unique(['subject_id', 'student_class_id', 'academic_year'], 'unique_class_subject_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_assignments');
    }
};
