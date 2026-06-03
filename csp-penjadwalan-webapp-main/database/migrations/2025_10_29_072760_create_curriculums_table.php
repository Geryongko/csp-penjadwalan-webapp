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
        Schema::create('curriculums', function (Blueprint $table) {
            $table->id('curriculum_id');
            $table->foreignId('program_id')->constrained('programs', 'program_id');
            $table->foreignId('subject_id')->constrained('subjects', 'subject_id');
            $table->integer('semester');
            $table->enum('category', ['MKU', 'WAJIB_PRODI', 'WAJIB_FAKULTAS', 'PILIHAN']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculums');
    }
};
