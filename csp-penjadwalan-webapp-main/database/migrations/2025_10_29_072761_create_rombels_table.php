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
        Schema::create('rombels', function (Blueprint $table) {
            $table->id('rombel_id');
            $table->string('rombel_name', 20); // e.g. "X MIPA 1"
            $table->integer('grade_level'); // 10, 11, 12
            $table->foreignId('program_id')->nullable()->constrained('programs', 'program_id');
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('users', 'user_id'); // Wali Kelas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rombels');
    }
};
