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
        Schema::create('profil', function (Blueprint $table) {
            $table->id();//field ID, autoincrement, integer, PK
            $table->bigInteger('nim')->unique();// nim
            $table->string('nama');// nama
            $table->string('email');// email
            $table->enum('jurusan',['IT','SI','AK']);// jurusan
            $table->text('alamat');// alamat
            $table->timestamps();//created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil');
    }
};
