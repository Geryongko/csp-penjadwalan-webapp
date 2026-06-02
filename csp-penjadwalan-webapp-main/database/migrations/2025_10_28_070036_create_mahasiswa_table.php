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
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('nim')->unique();// nim
            $table->string('nama');// nama
            $table->string('email')->unique();// email
            $table->enum('jenis_kelamin',['L','P']);
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->text('alamat');// alamat
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mahasiswa');
    }
};
